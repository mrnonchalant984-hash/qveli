import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bad, ok, serverError } from "@/lib/http";
import { issueSingleVerificationCode } from "@/lib/verification";

export async function POST(req: NextRequest) {
  try {
    const { userId, channel } = await req.json();
    if (!userId || channel !== "EMAIL") return bad("Only email verification is enabled.");
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user || !user.verificationRequired) return bad("Verification session not found.", 404);
    const result = await issueSingleVerificationCode(user.id, channel, user.email, user.phoneNumber || "", user.name);
    return ok({ sent: result.sent, ...(result.developmentCode ? { developmentCode: result.developmentCode } : {}) });
  } catch { return serverError(); }
}
