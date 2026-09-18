import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { bad, created, serverError } from "@/lib/http";
import { cleanText, validEmail, validUsername } from "@/lib/validation";
import { issueVerificationCodes, normalizePhone, validPhone } from "@/lib/verification";
import { awardWelcomeBonusIfNeeded } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const email = cleanText(b.email, 160).toLowerCase();
    const username = cleanText(b.username, 30).toLowerCase();
    const name = cleanText(b.name, 80);
    const phoneNumber = normalizePhone(String(b.phoneNumber || ""));
    const password = typeof b.password === "string" ? b.password : "";
    const gender = cleanText(b.gender, 30) || null;
    const dateOfBirth = b.dateOfBirth ? new Date(String(b.dateOfBirth)) : null;
    if (name.length < 2) return bad("Enter your full name.");
    if (!validUsername(username)) return bad("Username must be 3-30 characters using only letters, numbers, or underscores.");
    if (!validEmail(email)) return bad("Enter a valid email address.");
    if (!validPhone(phoneNumber)) return bad("Enter a valid phone number, for example +2348012345678.");
    if (password.length < 8) return bad("Password must be at least 8 characters.");
    if (!dateOfBirth || Number.isNaN(dateOfBirth.getTime())) return bad("Select your date of birth.");
    if (dateOfBirth > new Date()) return bad("Date of birth cannot be in the future.");
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }, { phoneNumber }] } });
    if (exists) {
      if (exists.email === email) return bad("Email is already registered.", 409);
      if (exists.username === username) return bad("Username is already taken.", 409);
      return bad("Phone number is already registered.", 409);
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, username, name, passwordHash, bio: "", phoneNumber, dateOfBirth, gender, verificationRequired: true } });
    const wallet = await awardWelcomeBonusIfNeeded(user.id);
    const delivery = await issueVerificationCodes(user.id, email, phoneNumber, name);
    return created({ userId: user.id, next: "/verify-account", delivery, wallet, message: "Your verification codes have been sent." });
  } catch { return serverError(); }
}
