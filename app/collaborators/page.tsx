'use client';
import Link from 'next/link';
import { ArrowLeft, Bot, CreditCard, Database, Mail, Radio, Server, Sparkles } from 'lucide-react';

const services=[
 {name:'Supabase',role:'Storage',detail:'Qevli uses Supabase Storage for persistent media in production.',icon:Database,status:'Configured through environment variables.'},
 {name:'Neon',role:'PostgreSQL database',detail:'Qevli uses PostgreSQL-compatible database infrastructure for application data.',icon:Server,status:'Configure DATABASE_URL with your Neon connection string.'},
 {name:'LiveKit',role:'Realtime media',detail:'Qevli uses LiveKit for authenticated voice, video calls and live rooms.',icon:Radio,status:'Enabled when the LiveKit credentials are configured.'},
 {name:'Resend',role:'Email delivery',detail:'Qevli can use Resend for account verification and service emails.',icon:Mail,status:'Optional; SMTP fallback is also supported.'},
 {name:'Monnify',role:'Billing',detail:'Monnify remains in the codebase for future billing activation.',icon:CreditCard,status:'Currently disabled; sandbox configuration is retained.'},
 {name:'OpenAI',role:'Optional AI provider',detail:'Qevli can use an OpenAI API key for its optional AI feature.',icon:Bot,status:'Optional; the feature remains usable without the provider.'},
];
export default function Collaborators(){return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/" className="back"><ArrowLeft size={18}/> Qevli</Link><Link href="/dashboard" className="topBrand"><span className="topQ">Q</span><b>Qevli</b></Link></header><div className="simpleWrap"><div className="pageEyebrow"><Sparkles size={15}/> Technology</div><h1>Qevli infrastructure</h1><p className="lead">The services below are technologies Qevli can use or is configured to use. Listing a service does not imply sponsorship, endorsement or a commercial partnership unless a separate agreement exists.</p><section className="featureGrid two">{services.map(({name,role,detail,icon:Icon,status})=><article className="featureCard darkCard" key={name}><div className="featureIcon"><Icon size={22}/></div><div className="pageEyebrow">{role}</div><h2>{name}</h2><p>{detail}</p><small>{status}</small></article>)}</section><p style={{marginTop:24}}><Link href="/company" className="outline">Company identity</Link></p></div></main>}
