import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, serverError, unauthorized } from '@/lib/http';
import { flags } from '@/lib/platform';
import { initializeTransaction } from '@/lib/monnify';

const fallbackProfileBoostPlans = {
  'profile-boost-7d': { id: 'profile-boost-7d', code: 'profile-boost-7d', name: 'Profile Boost', priceMinor: 5000, currency: 'NGN', durationDays: 7 },
  'profile-boost-30d': { id: 'profile-boost-30d', code: 'profile-boost-30d', name: 'Profile Spotlight', priceMinor: 15000, currency: 'NGN', durationDays: 30 },
  'profile-boost-90d': { id: 'profile-boost-90d', code: 'profile-boost-90d', name: 'Featured Profile', priceMinor: 35000, currency: 'NGN', durationDays: 90 },
} as const;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!flags.monetization) return bad('Qevli monetization is disabled.', 403);
  try {
    const body = await req.json();
    const planCode = String(body.planCode || '').trim();
    const targetUserId = String(body.targetUserId || user.id).trim();
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return bad('Profile not found.', 404);

    const plan = await prisma.subscriptionPlan.findFirst({ where: { code: planCode, active: true } });
    const boostPlan = plan || fallbackProfileBoostPlans[planCode as keyof typeof fallbackProfileBoostPlans];
    if (!boostPlan) return bad('Active profile boost plan not found.', 404);
    const amountMinor = Number((boostPlan as any).priceMinor || 0);
    if (amountMinor <= 0) return bad('This plan does not require payment.');

    const randomCode = `${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const paymentReference = `QEVLI-BOOST-${user.id}-${randomCode}`;

    const boost = await prisma.profileBoost.create({
      data: {
        targetUserId: targetUser.id,
        requesterUserId: user.id,
        planCode: boostPlan.code,
        status: 'PENDING',
        amountMinor,
        currency: (boostPlan as any).currency || 'NGN',
        provider: 'MONNIFY',
        providerRef: paymentReference,
        randomCode,
        metadata: {
          targetUserId: targetUser.id,
          requestUserId: user.id,
          durationDays: (boostPlan as any).durationDays || 30,
          planName: (boostPlan as any).name || 'Profile Boost',
        },
      },
    });

    await prisma.paymentRecord.create({
      data: {
        userId: user.id,
        kind: 'PROFILE_BOOST',
        amountMinor,
        currency: (boostPlan as any).currency || 'NGN',
        status: 'PENDING',
        provider: 'MONNIFY',
        providerRef: paymentReference,
        metadata: { boostId: boost.id, targetUserId: targetUser.id, planCode: boostPlan.code, randomCode },
      },
    });

    const transaction = await initializeTransaction({
      amountNaira: amountMinor / 100,
      paymentReference,
      customerName: user.name,
      customerEmail: user.email,
      description: `Qevli profile boost for @${targetUser.username}`,
      redirectUrl: process.env.MONNIFY_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?billing=complete`,
    });

    return ok({ checkoutUrl: transaction.checkoutUrl, paymentReference, transactionReference: transaction.transactionReference, boostId: boost.id });
  } catch (error) {
    console.error('Monnify profile boost failed', error);
    return serverError(error instanceof Error ? error.message : 'Monnify transaction initialization failed.');
  }
}
