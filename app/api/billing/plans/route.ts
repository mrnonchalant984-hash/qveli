import { prisma } from '@/lib/prisma';
import { ok, serverError } from '@/lib/http';
import { flags } from '@/lib/platform';

const defaultBoostPlans = [
  { id: 'profile-boost-7d', code: 'profile-boost-7d', name: 'Profile Boost', description: 'Boost a profile for 7 days to get more visibility in discovery.', priceMinor: 5000, currency: 'NGN', active: true },
  { id: 'profile-boost-30d', code: 'profile-boost-30d', name: 'Profile Spotlight', description: 'Boost a profile for 30 days with priority placement.', priceMinor: 15000, currency: 'NGN', active: true },
  { id: 'profile-boost-90d', code: 'profile-boost-90d', name: 'Featured Profile', description: 'Boost a profile for 90 days and keep it highly visible.', priceMinor: 35000, currency: 'NGN', active: true },
];

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { priceMinor: 'asc' } });
    return ok({
      enabled: flags.monetization,
      plans: plans.length ? plans : defaultBoostPlans,
    });
  } catch {
    return ok({ enabled: flags.monetization, plans: defaultBoostPlans });
  }
}
