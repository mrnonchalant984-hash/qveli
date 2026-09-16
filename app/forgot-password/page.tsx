"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/auth/request-password-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error || 'Unable to request a reset.');
    setMessage(data.developmentToken ? `Development reset token: ${data.developmentToken}` : 'If that email exists, reset instructions have been sent.');
  };

  return <main className="authPage"><div className="authBrand"><Link href="/"><span className="qIcon">Q</span> Qevli</Link><Link href="/login" className="back">Back to login</Link></div><div className="authLayout"><section className="authPitch"><div className="eyebrow">Account recovery</div><h1>Get back to your Qevli world.</h1><p>Enter your email and we will create a secure password reset link.</p></section><section className="authCard"><div className="authHeading"><h2>Forgot password?</h2><p>Reset links expire after 30 minutes.</p></div><form onSubmit={submit}><label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label><button className="primaryBtn full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>{message && <div className="demoNotice">{message}</div>}</form><p className="authFoot"><Link href="/login">Back to login</Link></p></section></div></main>;
}
