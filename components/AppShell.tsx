'use client';
import Link from 'next/link';
import { Home, MessageCircle, User, Settings, Bell, Search, Users, Compass, CalendarDays, ShoppingBag, Gamepad2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const primary=[
  ['/','Home',Home],['/explore','Explore',Compass],['/groups','Groups',Users],['/events','Events',CalendarDays],['/marketplace','Marketplace',ShoppingBag],['/gaming','Gaming',Gamepad2],['/messages','Messages',MessageCircle],['/notifications','Notifications',Bell],
] as const;

export function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname(); const [me,setMe]=useState<any>(null); const [q,setQ]=useState('');
 useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(x=>setMe(x.user)).catch(()=>{})},[]);
 if(path?.startsWith('/login')||path?.startsWith('/signup')) return <>{children}</>;
 return <div className="shell platformShell">
   <header className="platformTop">
     <Link href="/" className="platformBrand"><span>Q</span><b>Qevli</b></Link>
     <form className="globalSearch" onSubmit={e=>{e.preventDefault(); if(q.trim()) location.href=`/explore?q=${encodeURIComponent(q.trim())}`}}><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Qevli" aria-label="Search Qevli"/></form>
     <div className="topActions"><Link href="/messages"><MessageCircle size={19}/></Link><Link href="/notifications"><Bell size={19}/></Link>{me&&<Link href="/profile" className="topProfile"><User size={18}/><span>{me.name}</span></Link>}</div>
   </header>
   <aside className="platformSide"><div className="sideTitle">Qevli</div>{primary.map(([href,label,Icon])=><Link key={href} href={href} className={path===href||path?.startsWith(href+'/')?'active':''}><Icon size={19}/><span>{label}</span></Link>)}<Link href="/profile" className={path?.startsWith('/profile')?'active':''}><User size={19}/><span>Profile</span></Link><Link href="/settings" className={path?.startsWith('/settings')?'active':''}><Settings size={19}/><span>Settings</span></Link></aside>
   <main className="content platformContent">{children}</main>
   <nav className="nav platformBottom">{primary.slice(0,4).map(([href,label,Icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon size={20}/><span>{label}</span></Link>)}<Link className={path?.startsWith('/profile')?'active':''} href="/profile"><User size={20}/><span>Profile</span></Link></nav>
 </div>
}
