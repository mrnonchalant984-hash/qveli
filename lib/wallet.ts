import { prisma } from "@/lib/prisma";

const WELCOME_COIN_BONUS = 100;

export async function awardWelcomeBonusIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { granted: false, balance: 0 };
  if (user.walletBonusAwardedAt) return { granted: false, balance: user.coinBalance };

  const balance = user.coinBalance + WELCOME_COIN_BONUS;
  await prisma.user.update({
    where: { id: userId },
    data: {
      coinBalance: balance,
      walletBonusAwardedAt: new Date(),
    },
  });

  return { granted: true, balance };
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
