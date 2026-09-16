'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Radio, Video, Square } from 'lucide-react';
import LiveKitRoom from '@/components/LiveKitRoom';

type User={id:string;name:string;username:string;avatarUrl?:string|null;verified?:boolean};
type Stream={id:string;title:string;description:string;status:string;viewerCount:number;host:User};

export default function Live(){
 const [streams,setStreams]=useState<Stream[]>([]),[me,setMe]=useState<User|null>(null),[title,setTitle]=useState(''),[description,setDescription]=useState(''),[active,setActive]=useState<Stream|null>(null),[mode,setMode]=useState<'host'|'viewer'>('viewer'),[error,setError]=useState('');
 const load=async()=>{const r=await fetch('/api/live',{cache:'no-store'});if(r.ok){const j=await r.json();setStreams(j.streams||[])}};
 useEffect(()=>{(async()=>{const a=await fetch('/api/auth/me');if(a.ok){const j=await a.json();setMe(j.user)}load()})();const t=setInterval(load,5000);return()=>clearInterval(t)},[]);
 const start=async()=>{const r=await fetch('/api/live',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description})});const j=await r.json();if(!r.ok){setError(j.error||'Could not start live');return}setActive(j.stream);setMode('host');setTitle('');setDescription('');load()};
 const end=async()=>{if(!active)return;await fetch(`/api/live/${active.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'ENDED'})});setActive(null);load()};
 return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/dashboard" className="back"><ArrowLeft size={18}/> Home</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header>
 <section className="featurePage"><div className="pageHero"><div><small>LIVE</small><h1>Qevli Live</h1><p>Real-time live video is carried by LiveKit. Qevli keeps the stream record, host permissions and discovery in PostgreSQL.</p></div><Radio size={38}/></div>
 <div className="featureCard darkCard liveCreate"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Live title"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell viewers what you're doing..."/><button className="primaryBtn" onClick={start}><Video size={17}/> Start live</button></div>
 <div className="featureGrid two">{streams.map(s=><article className="featureCard darkCard" key={s.id}><div className="liveBadge"><span/> {s.status}</div><h3>{s.title}</h3><p>{s.description||'Qevli live session.'}</p><small>@{s.host.username} · {s.viewerCount} viewers</small><button className="secondaryBtn" onClick={()=>{setActive(s);setMode(me?.id===s.host.id?'host':'viewer')}}>Open live room</button></article>)}</div>
 </section>{active&&<div className="overlay"><div className="liveRoom"><LiveKitRoom kind="LIVE" id={active.id} mode={mode} title={active.title} onClose={()=>setActive(null)} onEnded={mode==='host'?end:undefined}/>{mode==='host'&&<div className="liveRoomActions"><button className="primaryBtn" onClick={end}><Square size={15}/> End stream</button></div>}</div></div>}{error&&<button className="toast" onClick={()=>setError('')}>{error}</button>}</main>
}
