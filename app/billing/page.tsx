'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, LoaderCircle } from 'lucide-react';

type Plan = { id: string; code: string; name: string; description: string; priceMinor: number; currency: string };

export default function Billing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetch('/api/billing/plans', { cache: 'no-store' }).then(async response => { const data = await response.json(); if (response.ok) { setPlans(data.plans || []); setEnabled(!!data.enabled); } else setMessage(data.error || 'Unable to load plans.'); }).catch(() => setMessage('Unable to connect to billing.')); }, []);

  const subscribe = async (planCode: string) => {
    setBusy(planCode); setMessage('');
    try {
      const response = await fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planCode }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || 'Could not start checkout.'); return; }
      window.location.assign(data.checkoutUrl);
    } catch { setMessage('Unable to connect to Monnify.'); } finally { setBusy(''); }
  };

  return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/settings" className="back"><ArrowLeft size={18}/> Settings</Link><Link href="/dashboard" className="topBrand"><span className="topQ">Q</span><b>Qevli</b></Link></header><section className="featurePage"><div className="pageHero"><div><small>QEVLI BILLING</small><h1>Plans that support the community</h1><p>Choose a Qevli plan and complete secure checkout.</p></div><CreditCard size={40}/></div>{!enabled&&<div className="featureCard darkCard"><b>Billing is not enabled on this deployment.</b><p>Payment options are temporarily unavailable.</p></div>}{enabled&&<div className="featureGrid two">{plans.map(plan=><article className="featureCard darkCard" key={plan.id}><div className="pageEyebrow"><CheckCircle2 size={15}/> {plan.name}</div><h2>{plan.currency} {(plan.priceMinor / 100).toLocaleString()}</h2><p>{plan.description}</p><button className="primaryBtn" disabled={!!busy} onClick={() => subscribe(plan.code)}>{busy === plan.code ? <LoaderCircle className="spin" size={16}/> : <CreditCard size={16}/>} {busy === plan.code ? 'Opening checkout...' : 'Continue to secure checkout'}</button></article>)}</div>}{enabled&&!plans.length&&<div className="emptyState">No active plans have been configured yet.</div>}{message&&<div className="toast">{message}</div>}</section></main>;
}
