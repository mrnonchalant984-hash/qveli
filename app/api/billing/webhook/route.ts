import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { ok, bad, serverError } from '@/lib/http';
import { flags } from '@/lib/platform';
import { verifyWebhookSignature } from '@/lib/monnify';

export async function POST(req: NextRequest) {
	try {
		if (!flags.monetization) return bad('Qevli monetization is disabled.', 403);
		const rawBody = await req.text();
		if (!verifyWebhookSignature(rawBody, req.headers.get('monnify-signature'))) return bad('Invalid webhook signature.', 401);
		const payload = JSON.parse(rawBody) as any;
		const eventData = payload.eventData || payload.data || {};
		const provider = 'MONNIFY';
		const eventId = String(payload.eventId || eventData.transactionReference || crypto.randomUUID());
		const existing = await prisma.webhookEvent.findUnique({ where: { provider_eventId: { provider, eventId } } });
		if (existing) return ok({ received: true, duplicate: true });
		await prisma.webhookEvent.create({ data: { provider, eventId, payload } });
		const paymentReference = String(eventData.paymentReference || '');
		const payment = paymentReference ? await prisma.paymentRecord.findFirst({ where: { provider, providerRef: paymentReference } }) : null;
		const status = String(eventData.paymentStatus || eventData.status || '').toUpperCase();
		if (payment && ['PAID', 'SUCCESS', 'COMPLETED'].includes(status)) {
			const paymentMetadata = (payment.metadata as Record<string, unknown> | null) || {};
			const planCode = String(paymentMetadata.planCode || '');
			const boostId = typeof paymentMetadata.boostId === 'string' ? paymentMetadata.boostId : null;
			const plan = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } });
			await prisma.$transaction(async tx => {
				await tx.paymentRecord.update({ where: { id: payment.id }, data: { status: 'PAID', providerRef: String(eventData.transactionReference || paymentReference), metadata: { ...paymentMetadata, monnify: eventData } } });
				if (boostId) {
					const boost = await tx.profileBoost.findUnique({ where: { id: boostId }, select: { metadata: true, targetUserId: true } });
					if (boost) {
						const metadata = (boost.metadata as Record<string, unknown> | null) || {};
						const durationDays = Number(metadata.durationDays || 30);
						const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
						await tx.profileBoost.update({ where: { id: boostId }, data: { status: 'APPROVED', approvedAt: new Date(), expiresAt, providerRef: String(eventData.transactionReference || paymentReference), metadata: { ...metadata, monnify: eventData, paymentConfirmedAt: new Date().toISOString(), activation: 'AUTOMATIC_AFTER_PAYMENT' } } });
						await tx.user.update({ where: { id: boost.targetUserId }, data: { profileBoostedUntil: expiresAt } });
					}
				}
				if (plan) await tx.subscription.create({ data: { userId: payment.userId, planId: plan.id, status: 'ACTIVE', provider, providerRef: paymentReference, startsAt: new Date() } });
				await tx.webhookEvent.update({ where: { provider_eventId: { provider, eventId } }, data: { processedAt: new Date() } });
			});
		} else if (payment && ['FAILED', 'CANCELLED', 'CANCELED'].includes(status)) {
			await prisma.paymentRecord.update({ where: { id: payment.id }, data: { status } });
		}
		return ok({ received: true });
	} catch (error) {
		console.error('Monnify webhook failed', error);
		return serverError();
	}
}
