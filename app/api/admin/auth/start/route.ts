import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashSecret } from '@/lib/platform';
import { sendEmail } from '@/lib/email';
import { bad, ok, serverError } from '@/lib/http';

function makeCode() { return String(crypto.randomInt(100000, 1000000)); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) return bad('Admin email and password are required.');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN' || !(await bcrypt.compare(password, user.passwordHash))) {
      return bad('Invalid admin login details.', 401);
    }

    const code = makeCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.adminAuthCode.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.adminAuthCode.create({
      data: { userId: user.id, codeHash: hashSecret(code), expiresAt }
    });

    const emailEnabled = process.env.QEVLI_EMAIL_ENABLED === 'true';
    let sent = false;
    if (emailEnabled) {
      sent = await sendEmail({
        to: user.email,
        subject: 'Your Qevli Admin verification code',
        html: `<div style="font-family:Arial,sans-serif"><h2>Qevli Admin verification</h2><p>Hi ${user.name},</p><p>Use this code to finish signing in to the Qevli Admin Control Center:</p><p style="font-size:32px;font-weight:800;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes.</p><p>If you did not request this, secure your Qevli account immediately.</p></div>`
      });
    }

    if (process.env.NODE_ENV === 'production' && !sent) {
      return bad('Admin verification email is not configured. Set QEVLI_EMAIL_ENABLED=true with RESEND_API_KEY and EMAIL_FROM before production admin access.', 503);
    }

    return ok({
      challengeId: user.id,
      email: user.email,
      sent,
      developmentCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });
  } catch {
    return serverError();
  }
}
