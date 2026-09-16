"use client";
import Link from "next/link";
import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const token = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') || '';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const data = await response.json();
    setBusy(false);
    setMessage(response.ok ? 'Password updated. You can now log in.' : data.error || 'Unable to reset password.');
  };

  return <main className="authPage"><div className="authBrand"><Link href="/"><span className="qIcon">Q</span> Qevli</Link><Link href="/login" className="back">Back to login</Link></div><div className="authLayout"><section className="authPitch"><div className="eyebrow">Secure account recovery</div><h1>Choose a new password.</h1><p>Use at least eight characters, then return to your Qevli community.</p></section><section className="authCard"><div className="authHeading"><h2>Reset password</h2><p>Your reset link is valid for 30 minutes.</p></div><form onSubmit={submit}><label>New password<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Create a strong password"/></label><button className="primaryBtn full" disabled={busy || !token}>{busy ? 'Updating…' : 'Update password'}</button>{message && <div className="demoNotice">{message}</div>}</form><p className="authFoot"><Link href="/login">Return to login</Link></p></section></div></main>;
}
