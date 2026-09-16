'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Video, PhoneCall, PhoneOff } from 'lucide-react';
import LiveKitRoom from '@/components/LiveKitRoom';

type User={id:string;name:string;username:string;avatarUrl?:string|null};
type Call={id:string;kind:string;status:string;createdAt:string;caller:User;callee:User};

export default function Calls(){
 const [calls,setCalls]=useState<Call[]>([]),[me,setMe]=useState<User|null>(null),[username,setUsername]=useState(''),[kind,setKind]=useState('VIDEO'),[error,setError]=useState(''),[active,setActive]=useState<Call|null>(null),[activeMode,setActiveMode]=useState<'call'|'host'|'viewer'>('call');
 const load=async()=>{const r=await fetch('/api/calls',{cache:'no-store'});if(r.ok){const j=await r.json();setCalls(j.calls||[])}};
 useEffect(()=>{(async()=>{const a=await fetch('/api/auth/me');if(!a.ok){location.href='/login';return}const j=await a.json();setMe(j.user);load()})();const t=setInterval(load,3000);return()=>clearInterval(t)},[]);
 const start=async()=>{const r=await fetch('/api/calls',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,kind})});const j=await r.json();if(!r.ok){setError(j.error||'Could not start call');return}setUsername('');setActive(j.call);setActiveMode('call');load()};
 const update=async(id:string,status:string)=>{const r=await fetch(`/api/calls/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});if(!r.ok){const j=await r.json().catch(()=>({}));setError(j.error||'Could not update call');return}if(status==='ENDED'||status==='DECLINED')setActive(null);load()};
 const accept=(c:Call)=>{setActive(c);setActiveMode('call');update(c.id,'ACTIVE')};
 return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/dashboard" className="back"><ArrowLeft size={18}/> Home</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header>
 <section className="featurePage"><div className="pageHero"><div><small>CONNECT</small><h1>Voice & video calls</h1><p>Qevli calls now use a real WebRTC media room through LiveKit. Your database stores the call session; LiveKit carries the encrypted audio/video.</p></div><PhoneCall size={38}/></div>
 <div className="featureCard darkCard callStart"><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Qevli username"/><select value={kind} onChange={e=>setKind(e.target.value)}><option value="VIDEO">Video call</option><option value="VOICE">Voice call</option></select><button className="primaryBtn" onClick={start}>{kind==='VIDEO'?<Video size={17}/>:<Phone size={17}/>} Start call</button></div>
 <div className="featureCard darkCard"><h3>Recent & incoming calls</h3>{calls.length?calls.map(c=>{const incoming=me?.id===c.callee.id&&c.status==='RINGING';return <div className="callRow" key={c.id}><div><b>{c.kind==='VIDEO'?'Video':'Voice'} · {c.status}</b><span>{c.caller.name} → {c.callee.name}</span></div><div className="callRowActions">{incoming&&<button className="primaryBtn" onClick={()=>accept(c)}>Answer</button>}{incoming&&<button className="secondaryBtn" onClick={()=>update(c.id,'DECLINED')}>Decline</button>}{!incoming&&c.status==='RINGING'&&me?.id===c.caller.id&&<button className="secondaryBtn" onClick={()=>update(c.id,'ENDED')}><PhoneOff size={14}/> Cancel</button>}<small>{new Date(c.createdAt).toLocaleString()}</small></div></div>}) : <p className="mutedText">No calls yet.</p>}</div>
 </section>{active&&<div className="overlay"><LiveKitRoom kind="CALL" id={active.id} mode={activeMode} title={`${active.kind==='VIDEO'?'Video':'Voice'} call · @${active.callee.username}`} onClose={()=>setActive(null)} onEnded={()=>update(active.id,'ENDED')}/></div>}{error&&<button className="toast" onClick={()=>setError('')}>{error}</button>}</main>
}
