import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "change-this-secret-before-production");
const COOKIE = "qevli_session";

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  try { await prisma.userSession.create({ data: { userId, sessionHash: crypto.createHash("sha256").update(token).digest("hex"), userAgent: "qevli-web", deviceName: "Web browser" } }); } catch {}
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSession() { (await cookies()).delete(COOKIE); }

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
  } catch { return null; }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export function publicUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    school: user.school,
    schoolUrl: user.schoolUrl,
    workplace: user.workplace,
    workplaceUrl: user.workplaceUrl,
    jobTitle: user.jobTitle,
    currentCity: user.currentCity,
    hometown: user.hometown,
    website: user.website,
    education: user.education,
    interests: user.interests,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    role: user.role,
    professionalMode: user.professionalMode,
    verified: user.verified,
    verifiedAt: user.verifiedAt,
    profileBoostedUntil: user.profileBoostedUntil,
    coinBalance: user.coinBalance ?? 0,
    isProfileBoosted: !!user.profileBoostedUntil && new Date(user.profileBoostedUntil).getTime() > Date.now(),
    emailVerifiedAt: user.emailVerifiedAt,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  };
}
