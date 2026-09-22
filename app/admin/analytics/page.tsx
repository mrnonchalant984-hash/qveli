'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, BarChart3, FileText, Heart, MessageCircle, Users, UserPlus, Eye, Globe2, Smartphone, Monitor, Compass, ShieldAlert, Radio, ShoppingBag, Gamepad2, CalendarDays, Layers3 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const labels: Record<string, string> = { SCHOOL: 'School', FRIEND: 'Friend', GOOGLE: 'Google', TIKTOK: 'TikTok', INSTAGRAM: 'Instagram', TWITTER: 'X / Twitter', AI: 'ChatGPT / AI', OTHER: 'Other' };

function Stat({ icon: Icon, value, label }: any) {
  return <article className="analyticsStat"><Icon size={18}/><strong>{Number(value || 0).toLocaleString()}</strong><span>{label}</span></article>;
}

function MiniList({ title, rows, empty = 'No data yet.' }: { title: string; rows: { label?: string; path?: string; name?: string; count: number }[]; empty?: string }) {
  return <section className="analyticsPanel"><div className="analyticsPanelHead"><h2>{title}</h2><span>{rows.length}</span></div>{rows.length ? rows.map((r, i) => <div className="analyticsRow" key={`${r.label || r.path || r.name}-${i}`}><b>{r.label || r.path || r.name}</b><span>{r.count.toLocaleString()}</span></div>) : <p className="analyticsEmpty">{empty}</p>}</section>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const load = async () => {
    try { const r = await fetch('/api/admin/analytics', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Unable to load analytics.'); setData(j); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load analytics.'); }
  };
  useEffect(() => { void load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  const o = data?.overview || {};
  return <main className="analyticsPage">
    <header className="analyticsTop"><Link href="/admin" className="analyticsBack"><ArrowLeft size={18}/> Admin</Link><div className="analyticsBrand"><span>Q</span><b>Qevli</b><small>Analytics</small></div><div className="analyticsLive"><i/> Live · 30 days</div></header>
    <div className="analyticsWrap">
      <div className="analyticsHero"><div><div className="analyticsEyebrow"><BarChart3 size={14}/> Native platform intelligence</div><h1>Qevli Analytics</h1><p>Understand people, content, engagement, traffic and the health of the social platform from one operational dashboard.</p></div><button onClick={() => void load()} className="analyticsRefresh">Refresh data</button></div>
      {error && <div className="analyticsError">{error}</div>}
      <section className="analyticsStats">
        <Stat icon={Users} value={o.users} label="Total users"/><Stat icon={UserPlus} value={o.newUsers30} label="New users · 30d"/><Stat icon={Activity} value={o.dau} label="DAU"/><Stat icon={Users} value={o.wau} label="WAU"/><Stat icon={Users} value={o.mau} label="MAU"/><Stat icon={Eye} value={o.pageViews} label="Page views · 30d"/>
      </section>
      <section className="analyticsChartPanel"><div className="analyticsPanelHead"><div><h2>Platform traffic</h2><p>Daily page views and unique browser sessions captured by Qevli.</p></div><span>30D</span></div><div className="analyticsChart"><ResponsiveContainer width="100%" height={300}><AreaChart data={data?.daily || []}><defs><linearGradient id="qevliViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity={0.32}/><stop offset="100%" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.12}/><XAxis dataKey="date" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Area type="monotone" dataKey="views" strokeWidth={2} fill="url(#qevliViews)" name="Page views"/><Area type="monotone" dataKey="sessions" strokeWidth={2} fill="none" name="Sessions"/></AreaChart></ResponsiveContainer></div></section>
      <section className="analyticsStats compact">
        <Stat icon={FileText} value={o.posts} label="Posts"/><Stat icon={Heart} value={o.reactions} label="Reactions"/><Stat icon={MessageCircle} value={o.comments} label="Comments"/><Stat icon={MessageCircle} value={o.messages} label="Messages"/><Stat icon={UserPlus} value={o.follows} label="Follows"/><Stat icon={Radio} value={o.stories} label="Stories"/><Stat icon={Eye} value={o.storyViews} label="Story views"/><Stat icon={Layers3} value={o.groups} label="Groups"/><Stat icon={CalendarDays} value={o.events} label="Events"/><Stat icon={ShoppingBag} value={o.listings} label="Marketplace listings"/><Stat icon={Gamepad2} value={o.teams} label="Gaming teams"/><Stat icon={ShieldAlert} value={o.reports} label="Reports"/>
      </section>
      <div className="analyticsGrid two"><MiniList title="Top pages" rows={data?.topPages || []}/><MiniList title="Top events" rows={data?.eventCounts || []}/></div>
      <div className="analyticsGrid four"><MiniList title="Devices" rows={data?.devices || []}/><MiniList title="Browsers" rows={data?.browsers || []}/><MiniList title="Operating systems" rows={data?.operatingSystems || []}/><MiniList title="Referrers" rows={data?.referrers || []}/></div>
      <section className="analyticsPanel onboardingPanel"><div className="analyticsPanelHead"><div><h2>How people discovered Qevli</h2><p>Onboarding answers from registered users.</p></div><Compass size={18}/></div>{(data?.onboarding || []).map((r: any) => <div className="analyticsBarRow" key={r.source}><div><b>{labels[r.source] || r.source}</b><span>{r.count.toLocaleString()}</span></div><i style={{ width: `${Math.max(4, ((r.count / Math.max(...(data?.onboarding || [{count:1}]).map((x:any)=>x.count))) * 100))}%` }}/></div>)}</section>
      <footer className="analyticsFooter">Last updated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'} · Qevli native analytics</footer>
    </div>
  </main>;
}
