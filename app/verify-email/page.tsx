"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email…');
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || '';
    fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).then(async response => {
      const data = await response.json();
      setMessage(response.ok ? 'Email verified successfully.' : data.error || 'Verification failed.');
    }).catch(() => setMessage('Unable to verify email right now.'));
  }, []);
  return <main className="authPage"><div className="authBrand"><Link href="/"><span className="qIcon">Q</span> Qevli</Link></div><section className="authCard" style={{maxWidth:480,margin:'80px auto'}}><div className="authHeading"><h2>{message}</h2><p><Link href="/login">Continue to login</Link></p></div></section></main>;
}
