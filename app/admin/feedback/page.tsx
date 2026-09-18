'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type Request = { id: string; title: string; description?: string | null; category: string; status: string; _count: { votes: number } };
export default function AdminFeedback() {
  const [requests, setRequests] = useState<Request[]>([]), [message, setMessage] = useState('');
  useEffect(() => { fetch('/api/feedback').then(async response => { if (response.ok) setRequests((await response.json()).requests || []); else setMessage('Admin access required.'); }); }, []);
  const status = async (requestId: string, value: string) => { const response = await fetch('/api/admin/feedback', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, status: value }) }); if (response.ok) setRequests(items => items.map(item => item.id === requestId ? { ...item, status: value } : item)); else setMessage('Could not update status.'); };
  return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/admin" className="back"><ArrowLeft size={18}/> Admin</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header><div className="simpleWrap"><h1>Feature requests</h1><p className="lead">Review what the community wants next.</p>{message && <div className="demoNotice">{message}</div>}<section className="adminTable">{requests.map(request => <article className="adminRow" key={request.id}><div><b>{request.title}</b><small>{request.category} · {request._count?.votes || 0} votes</small><p>{request.description}</p></div><select value={request.status} onChange={event => status(request.id, event.target.value)}><option value="REQUESTED">Requested</option><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></article>)}</section></div></main>;
}
