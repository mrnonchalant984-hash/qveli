import nodemailer from 'nodemailer';

type EmailInput = { to: string; subject: string; html: string };

async function sendViaSmtp({ to, subject, html }: EmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  if (!host || !user || !pass || !from) return false;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      
    });
    const info = await transporter.sendMail({ from, to, subject, html });
    return !!info.messageId;
  } catch {
    return false;
  }
}

export async function sendEmail({ to, subject, html }: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (apiKey && from) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, html }),
      });
      if (response.ok) return true;
    } catch {
      // fall back to SMTP below
    }
  }

  return sendViaSmtp({ to, subject, html });
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}
