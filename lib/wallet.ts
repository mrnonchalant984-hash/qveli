import { prisma } from "@/lib/prisma";

const WELCOME_COIN_BONUS = 100;

export async function awardWelcomeBonusIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { granted: false, balance: 0, reason: "missing" as const };
  if (user.walletBonusAwardedAt) return { granted: false, balance: user.coinBalance, reason: "already-awarded" as const };
  const complete = Boolean(user.name?.trim() && user.username?.trim() && user.bio?.trim() && user.avatarUrl && (user.school || user.workplace || user.education) && user.currentCity);
  if (!complete) return { granted: false, balance: user.coinBalance, reason: "profile-incomplete" as const };
  const updated = await prisma.user.updateMany({ where: { id: userId, walletBonusAwardedAt: null }, data: { coinBalance: { increment: WELCOME_COIN_BONUS }, walletBonusAwardedAt: new Date(), lastProfileCompletionAwardAt: new Date() } });
  const fresh = await prisma.user.findUnique({ where: { id: userId }, select: { coinBalance: true } });
  return { granted: updated.count === 1, balance: fresh?.coinBalance ?? user.coinBalance, reason: updated.count === 1 ? "granted" as const : "already-awarded" as const };
}

export async function spendCoinsIfPossible(userId: string, requiredCoins: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "User not found." };
  if (requiredCoins <= 0) return { ok: true as const, balance: user.coinBalance };
  if (user.coinBalance < requiredCoins) {
    return { ok: false as const, error: `You need ${requiredCoins} coins to unlock this boost.`, balance: user.coinBalance };
  }

  const balance = user.coinBalance - requiredCoins;
  await prisma.user.update({ where: { id: userId }, data: { coinBalance: balance } });
  return { ok: true as const, balance };
}
