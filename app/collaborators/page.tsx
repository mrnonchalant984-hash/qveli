'use client';

import Link from 'next/link';
import { ArrowLeft, Bot, CreditCard, Database, Github, Mail, Sparkles } from 'lucide-react';

const collaborators = [
  { name: 'OpenAI', role: 'AI assistance', detail: 'Helpful tools for ideas, discovery and smarter conversations.', icon: Bot },
  { name: 'Monnify', role: 'Secure checkout', detail: 'Payment infrastructure for one-time profile promotion campaigns.', icon: CreditCard },
  { name: 'GitHub', role: 'Engineering', detail: 'The home for Qevli code, review and deployment workflows.', icon: Github },
  { name: 'Supabase', role: 'Media storage', detail: 'Persistent storage for photos and videos shared on Qevli.', icon: Database },
  { name: 'Resend', role: 'Email delivery', detail: 'Reliable account verification and important platform emails.', icon: Mail },
];

export default function Collaborators() {
  return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/" className="back"><ArrowLeft size={18}/> Qevli</Link><Link href="/dashboard" className="topBrand"><span className="topQ">Q</span><b>Qevli</b></Link></header><div className="simpleWrap"><div className="pageEyebrow"><Sparkles size={15}/> Collaborators</div><h1>Built with trusted tools.</h1><p className="lead">Qevli brings together reliable technology partners so people can connect, create and grow in one place.</p><section className="featureGrid two">{collaborators.map(({ name, role, detail, icon: Icon }) => <article className="featureCard darkCard" key={name}><div className="featureIcon"><Icon size={22}/></div><div className="pageEyebrow">{role}</div><h2>{name}</h2><p>{detail}</p></article>)}</section></div></main>;
}
