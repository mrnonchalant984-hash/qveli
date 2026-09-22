import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getSecret(){ const raw=process.env.AUTH_SECRET; if(process.env.NODE_ENV === "production" && (!raw || raw.length < 32)) throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters in production."); return new TextEncoder().encode(raw || "local-development-only-qevli-secret-change-me"); }
const COOKIE = "qevli_session";
const SESSION_DAYS = 7;

export async function createSession(userId: string, remember = false) {
  const sessionId = crypto.randomUUID();
  const token = await new SignJWT({ userId, sid: sessionId })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${remember ? 30 : SESSION_DAYS}d`).sign(getSecret());
  const sessionHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.userSession.create({ data: { id: sessionId, userId, sessionHash, userAgent: "qevli-web", deviceName: "Web browser" } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * (remember ? 30 : SESSION_DAYS) });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      const sid = typeof payload.sid === "string" ? payload.sid : null;
      if (sid) await prisma.userSession.updateMany({ where: { id: sid, revokedAt: null }, data: { revokedAt: new Date() } });
    } catch {}
  }
  store.delete(COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    const sid = typeof payload.sid === "string" ? payload.sid : null;
    if (!userId || !sid) return null;
    const sessionHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await prisma.userSession.findFirst({ where: { id: sid, userId, sessionHash, revokedAt: null } });
    if (!session) return null;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) void prisma.userSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
    return user;
  } catch { return null; }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export function sessionUser(user:any){ return {...publicUser(user), role:user.role, emailVerifiedAt:user.emailVerifiedAt, twoFactorEnabled:user.twoFactorEnabled}; }

export function publicUser(user: any) {
  return { id:user.id, username:user.username, name:user.name, bio:user.bio, school:user.school, schoolUrl:user.schoolUrl, workplace:user.workplace, workplaceUrl:user.workplaceUrl, jobTitle:user.jobTitle, currentCity:user.currentCity, hometown:user.hometown, website:user.website, education:user.education, interests:user.interests, avatarUrl:user.avatarUrl, coverUrl:user.coverUrl, professionalMode:user.professionalMode, verified:user.verified, verifiedAt:user.verifiedAt, isProfileBoosted:!!user.profileBoostedUntil && new Date(user.profileBoostedUntil).getTime()>Date.now(), profileVisibility:user.profileVisibility||'PUBLIC', emailVerifiedAt:user.emailVerifiedAt||null, coinBalance:user.coinBalance||0, createdAt:user.createdAt };
}
