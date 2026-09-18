'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Source = { source: string; count: number };
const colors = ['#111827', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2', '#64748b'];

export default function AdminAnalytics() {
  const [sources, setSources] = useState<Source[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics/onboarding').then(async response => {
      const data = await response.json();
      if (response.ok) setSources(data.sources || []);
      else setMessage(data.error || 'Unable to load analytics.');
    }).catch(() => setMessage('Unable to load analytics.'));
  }, []);

  return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/admin" className="back"><ArrowLeft size={18}/> Admin</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header><div className="simpleWrap"><div className="pageEyebrow">Acquisition analytics</div><h1>How people discover Qevli</h1><p className="lead">Onboarding survey responses from verified users.</p>{message && <div className="demoNotice">{message}</div>}<section className="featureCard darkCard" style={{ minHeight: 420 }}>{sources.length ? <ResponsiveContainer width="100%" height={360}><PieChart><Pie data={sources} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={125}>{sources.map((source, index) => <Cell key={source.source} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <div className="emptyState">No survey responses yet.</div>}</section></div></main>;
}
