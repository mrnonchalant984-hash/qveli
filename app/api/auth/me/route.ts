import { getCurrentUser, sessionUser } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/http';
import { awardWelcomeBonusIfNeeded } from '@/lib/wallet';

export async function GET() {
	const user = await getCurrentUser();
	if (!user) return unauthorized();
	const wallet = await awardWelcomeBonusIfNeeded(user.id);
	return ok({ user: { ...sessionUser(user), coinBalance: wallet.balance }, wallet });
}
