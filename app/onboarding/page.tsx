'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const options = [['SCHOOL', '🏫 School'], ['FRIEND', '👥 Friend'], ['GOOGLE', '🔍 Google'], ['TIKTOK', '🎵 TikTok'], ['INSTAGRAM', '📸 Instagram'], ['AI', '🤖 AI / ChatGPT'], ['OTHER', '✨ Other']] as const;

export default function Onboarding() {
  const router = useRouter();
  const [source, setSource] = useState('');
  const [otherText, setOtherText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!source || (source === 'OTHER' && !otherText.trim())) { setMessage('Choose an option to continue.'); return; }
    setBusy(true); setMessage('');
    const response = await fetch('/api/onboarding/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source, otherText }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || 'Could not save your answer.'); else router.replace('/dashboard');
    setBusy(false);
  };
  return <main className="simplePage darkPage"><div className="simpleWrap narrow"><section className="authCard"><div className="pageEyebrow">Getting Qevli ready · 80%</div><h1>How did you hear about us?</h1><p className="lead">Your answer helps us understand how Qevli is growing.</p><div className="featureGrid two">{options.map(([value, label]) => <button className={source === value ? 'primaryBtn' : 'outline'} key={value} onClick={() => setSource(value)}>{label}</button>)}</div>{source === 'OTHER' && <label>Tell us a little more<input value={otherText} onChange={event => setOtherText(event.target.value)} placeholder="A short answer" /></label>}{message && <div className="demoNotice">{message}</div>}<div className="profileActions"><button className="primaryBtn" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Continue'}</button><button className="textBtn" onClick={() => router.replace('/dashboard')}>Skip for now</button></div></section></div></main>;
}
