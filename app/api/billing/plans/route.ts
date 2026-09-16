import { prisma } from '@/lib/prisma';
import { ok, serverError } from '@/lib/http';
import { flags } from '@/lib/platform';

const defaultBoostPlans = [
  { id: 'profile-boost-7d', code: 'profile-boost-7d', name: '7-day Profile Boost', description: 'A short campaign to put your profile in front of more people.', priceMinor: 250000, currency: 'NGN', active: true },
  { id: 'profile-boost-30d', code: 'profile-boost-30d', name: '30-day Profile Spotlight', description: 'Sustained visibility for creators, professionals and growing communities.', priceMinor: 750000, currency: 'NGN', active: true },
  { id: 'profile-boost-90d', code: 'profile-boost-90d', name: '90-day Featured Profile', description: 'Long-running profile promotion for serious audience growth.', priceMinor: 1800000, currency: 'NGN', active: true },
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
