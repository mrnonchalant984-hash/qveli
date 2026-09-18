import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { hashSecret } from "@/lib/platform";
import { sendEmail } from "@/lib/email";

function code() { return String(crypto.randomInt(100000, 1000000)); }

export function normalizePhone(value: string) {
  const raw = String(value || "").trim().replace(/[\s()-]/g, "");
  if (/^0\d{10}$/.test(raw)) return `+234${raw.slice(1)}`;
  return raw;
}

export function validPhone(value: string) { return /^\+[1-9]\d{7,14}$/.test(value); }

async function sendSms(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return false;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: to, From: from, Body: message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return response.ok;
}

export async function issueVerificationCodes(userId: string, email: string, phone: string, name: string) {
  const emailCode = code();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationCode.deleteMany({ where: { userId, usedAt: null } });
  await prisma.verificationCode.createMany({
    data: [
      { userId, channel: "EMAIL", codeHash: hashSecret(emailCode), expiresAt },
    ],
  });

  const emailEnabled = process.env.QEVLI_EMAIL_ENABLED === "true";
  const emailSent = emailEnabled && await sendEmail({
    to: email,
    subject: "Your Qevli verification code",
    html: `<div style="font-family:Arial,sans-serif"><h2>Verify your Qevli account</h2><p>Hi ${name},</p><p>Your email verification code is:</p><p style="font-size:30px;font-weight:800;letter-spacing:8px">${emailCode}</p><p>This code expires in 10 minutes.</p></div>`,
  });
  const development = process.env.NODE_ENV !== "production";
  return {
    emailSent: Boolean(emailSent),
    phoneSent: false,
    developmentCodes: development ? { email: emailCode } : undefined,
  };
}

export async function issueSingleVerificationCode(userId: string, channel: "EMAIL" | "PHONE", email: string, phone: string, name: string) {
  const value = code();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationCode.deleteMany({ where: { userId, channel, usedAt: null } });
  await prisma.verificationCode.create({ data: { userId, channel, codeHash: hashSecret(value), expiresAt } });
  let sent = false;
  if (channel === "EMAIL") {
    sent = process.env.QEVLI_EMAIL_ENABLED === "true" && await sendEmail({
      to: email,
      subject: "Your new Qevli verification code",
      html: `<p>Your new Qevli email verification code is <strong style="font-size:24px;letter-spacing:6px">${value}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
  } else return { sent: false, developmentCode: undefined };
  return { sent, developmentCode: process.env.NODE_ENV !== "production" ? value : undefined };
}

export async function consumeVerificationCode(userId: string, channel: "EMAIL" | "PHONE", value: string) {
  const row = await prisma.verificationCode.findFirst({ where: { userId, channel, usedAt: null }, orderBy: { createdAt: "desc" } });
  if (!row || row.expiresAt < new Date()) return { ok: false as const, error: "That code has expired. Request a new one." };
  if (row.attempts >= 5) return { ok: false as const, error: "Too many attempts. Request a new code." };
  if (hashSecret(String(value).trim()) !== row.codeHash) {
    await prisma.verificationCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false as const, error: "Incorrect verification code." };
  }
  await prisma.verificationCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return { ok: true as const };
}
