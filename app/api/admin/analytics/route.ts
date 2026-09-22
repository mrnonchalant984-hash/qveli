import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

async function distinctUsers(since: Date) {
  const rows = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since }, userId: { not: null } },
    select: { userId: true },
    distinct: ['userId'],
  });
  return new Set(rows.map((r) => r.userId).filter(Boolean) as string[]);
}

function countMetadata(rows: { metadata: unknown }[], key: string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>)[key] : null;
    if (typeof value !== 'string' || !value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 10);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== 'ADMIN') return bad('Admin access required.', 403);

    const since30 = daysAgo(30);
    const since7 = daysAgo(7);
    const since24 = daysAgo(1);
    const [dauSet, wauSet, mauSet, active7, users, posts, messages, comments, reactions, follows, stories, storyViews, groups, events, listings, teams, liveStreams, notifications, reports, newUsers30, pageViews, eventRows, onboarding, coinBalances, bonusRecipients] = await Promise.all([
      distinctUsers(since24), distinctUsers(since7), distinctUsers(since30),
      prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since7 }, userId: { not: null } }, select: { userId: true }, distinct: ['userId'] }),
      prisma.user.count(), prisma.post.count(), prisma.message.count(), prisma.comment.count(), prisma.postReaction.count(), prisma.follow.count(),
      prisma.story.count(), prisma.storyView.count(), prisma.group.count(), prisma.event.count(), prisma.marketplaceListing.count(), prisma.gamingTeam.count(), prisma.liveStream.count(), prisma.notification.count(), prisma.report.count(),
      prisma.user.count({ where: { createdAt: { gte: since30 } } }),
      prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since30 }, name: 'page_view' }, select: { path: true, metadata: true, createdAt: true } }),
      prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since30 } }, select: { name: true, metadata: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 50000 }),
      prisma.onboardingSurvey.groupBy({ by: ['source'], _count: { _all: true }, orderBy: { _count: { source: 'desc' } } }),
      prisma.user.aggregate({ _sum: { coinBalance: true } }),
      prisma.user.count({ where: { walletBonusAwardedAt: { not: null } } }),
    ]);

    const daily = Array.from({ length: 30 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (29 - index));
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const views = pageViews.filter((e) => e.createdAt >= day && e.createdAt < next).length;
      const active = new Set(eventRows.filter((e) => e.createdAt >= day && e.createdAt < next).map((e) => (e.metadata as any)?.sessionId).filter(Boolean)).size;
      return { date: day.toISOString().slice(5, 10), views, sessions: active };
    });

    const topPages = [...pageViews.reduce((m, e) => { const key = e.path || '/'; m.set(key, (m.get(key) || 0) + 1); return m; }, new Map<string, number>()).entries()]
      .map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 12);
    const eventCounts = [...eventRows.reduce((m, e) => { m.set(e.name, (m.get(e.name) || 0) + 1); return m; }, new Map<string, number>()).entries()]
      .map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 15);
    const returning7 = active7.filter((r) => r.userId).length;
    const metadataRows = eventRows.map((e) => ({ metadata: e.metadata }));

    const totalCoins = coinBalances._sum.coinBalance || 0;
    const totalCoinsEarned = bonusRecipients * 100;
    const collaboratorServices = [
      { name: 'Supabase', configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) },
      { name: 'Neon', configured: Boolean(process.env.DATABASE_URL) },
      { name: 'LiveKit', configured: Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) },
      { name: 'Resend', configured: Boolean(process.env.RESEND_API_KEY) },
      { name: 'Monnify', configured: process.env.QEVLI_MONETIZATION_ENABLED === 'true' },
      { name: 'OpenAI', configured: Boolean(process.env.OPENAI_API_KEY) },
    ];

    return ok({
      generatedAt: new Date().toISOString(), period: '30d',
      overview: {
        users, newUsers30, dau: dauSet.size, wau: wauSet.size, mau: mauSet.size,
        posts, messages, comments, reactions, follows, stories, storyViews, groups, events, listings, teams, liveStreams, notifications, reports,
        pageViews: pageViews.length, returning7,
        coinHolders: totalCoins > 0 ? await prisma.user.count({ where: { coinBalance: { gt: 0 } } }) : 0,
        totalCoins,
        totalCoinsEarned,
        totalCoinsSpent: Math.max(0, totalCoinsEarned - totalCoins),
        bonusRecipients,
        collaborators: collaboratorServices.length,
        configuredCollaborators: collaboratorServices.filter((service) => service.configured).length,
      },
      daily, topPages, eventCounts,
      devices: countMetadata(metadataRows, 'device'), browsers: countMetadata(metadataRows, 'browser'), operatingSystems: countMetadata(metadataRows, 'os'),
      referrers: countMetadata(metadataRows, 'referrer'), languages: countMetadata(metadataRows, 'language'), timezones: countMetadata(metadataRows, 'timezone'),
      onboarding: onboarding.map((r) => ({ source: r.source, count: r._count._all })),
      collaboratorServices,
    });
  } catch (error) {
    console.error('admin analytics', error);
    return serverError();
  }
}
