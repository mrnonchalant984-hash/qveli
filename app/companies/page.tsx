"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowLeft,Building2,CheckCircle2,Users,Heart,MessageCircle,Share2,Trash2,ExternalLink} from "lucide-react";

type C={id:string;name:string;slug:string;description:string;category:string;following:boolean;followers:number};
type Update={id:string;title:string;body:string;mediaUrl?:string|null;mediaType?:string|null;createdAt:string};

export default function Companies(){
 const [c,setC]=useState<C|null>(null),[updates,setUpdates]=useState<Update[]>([]),[error,setError]=useState('');
 const load=async()=>{try{const r=await fetch('/api/companies');const j=await r.json();if(!r.ok){setError(j.error||'Could not load company pages');return}const company=j.companies?.[0] as C|undefined;if(company){setC(company);const u=await fetch(`/api/companies/${company.slug}/updates`);const uj=await u.json();if(u.ok)setUpdates(uj.updates||[])}}catch{setError('Could not load Qviews')}};
 useEffect(()=>{void load()},[]);
 const follow=async()=>{if(!c)return;const r=await fetch(`/api/companies/${c.slug}/follow`,{method:'POST'});const j=await r.json();if(r.ok)setC({...c,following:j.following,followers:c.followers+(j.following?1:-1)});else setError(j.error||'Could not update follow')};
 return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/explore" className="back"><ArrowLeft size={18}/> Explore</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header><div className="simpleWrap narrow"><div className="pageEyebrow"><Building2 size={15}/> Official pages</div><h1>Qviews</h1><p className="lead">The official Qevli company page for product updates, launches and community news.</p>
 {c&&<section className="companyHero"><div className="companyLogo">Q</div><div className="companyHeroMain"><div className="pageEyebrow"><CheckCircle2 size={15}/> Official Qevli page</div><h2>{c.name}</h2><p>{c.category}</p><p>{c.description}</p><div className="companyMeta"><span><Users size={15}/> {c.followers} followers</span><button className={c.following?'create':'outline'} onClick={follow}>{c.following?'Following':'Follow Qviews'}</button></div></div></section>}
 <section className="qviewsUpdates"><div className="sectionHeading"><div><div className="pageEyebrow"><Building2 size={15}/> Official updates</div><h2>What's new on Qevli</h2></div><span>{updates.length} updates</span></div>
 {updates.length===0?<div className="simpleCard"><h3>No updates yet</h3><p>Official Qevli announcements will appear here when the Qevli administrator publishes them.</p></div>:updates.map(u=><article className="qviewsUpdate" key={u.id}><div className="qviewsUpdateHead"><div className="qviewsMini">Q</div><div><b>Qviews <CheckCircle2 size={14}/></b><small>{new Date(u.createdAt).toLocaleString()}</small></div></div><h3>{u.title}</h3><p>{u.body}</p>{u.mediaUrl&&u.mediaType==='VIDEO'?<video className="qviewsMedia" src={u.mediaUrl} controls/>:u.mediaUrl?<img className="qviewsMedia" src={u.mediaUrl} alt="Qviews update"/>:null}<div className="qviewsActions"><button><Heart size={15}/> Like</button><button><MessageCircle size={15}/> Comment</button><button><Share2 size={15}/> Share</button></div></article>)}
 </section><section className="simpleCard"><h2>Follow Qviews</h2><p>Follow the official page so you can keep up with new Qevli features, announcements and launches.</p><Link className="primary-link" href="/explore">Discover more on Qevli <ExternalLink size={14}/></Link></section>{error&&<button className="toast" onClick={()=>setError('')}>{error}</button>}</div></main>
}
