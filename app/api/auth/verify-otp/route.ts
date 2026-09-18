import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bad, ok, serverError } from "@/lib/http";
import { consumeVerificationCode } from "@/lib/verification";
import { createSession, publicUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown"; const rl=await rateLimit(`verify:${ip}`,15,600); if(!rl.allowed)return bad("Too many verification attempts. Please try again later.",429); const { userId, channel, code } = await req.json();
    if (!userId || channel !== "EMAIL" || !/^\d{6}$/.test(String(code || ""))) return bad("Email verification is required.");
    const result = await consumeVerificationCode(String(userId), channel, String(code));
    if (!result.ok) return bad(result.error, 400);
    const data = { emailVerifiedAt: new Date() };
    const user = await prisma.user.update({ where: { id: String(userId) }, data });
    const refreshed = await prisma.user.findUnique({ where: { id: user.id } });
    if (!refreshed) return bad("Account not found.", 404);
    if (refreshed.emailVerifiedAt && refreshed.verificationRequired) {
      await prisma.user.update({ where: { id: refreshed.id }, data: { verificationRequired: false } });
      await createSession(refreshed.id);
      const finalUser = await prisma.user.findUnique({ where: { id: refreshed.id } });
      return ok({ verified: true, complete: true, user: publicUser(finalUser || refreshed), redirect: "/onboarding" });
    }
    return ok({ verified: true, complete: false, channel });
  } catch { return serverError(); }
}
