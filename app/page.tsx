'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Globe2, Lock, MessageCircle, Sparkles, Users, Zap } from 'lucide-react';

export default function Landing() {
  const [demoStep, setDemoStep] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setDemoStep(step => (step + 1) % 3), 2400); return () => window.clearInterval(timer); }, []);
  return <main className="landing">
    <nav className="landingNav">
      <Link href="/" className="brandMark"><span className="qIcon">Q</span><span>Qevli</span></Link>
      <div className="navLinks"><a href="#features">Features</a><a href="#about">About</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      <div className="navActions"><Link className="navLogin" href="/login">Log in</Link><Link className="primaryBtn" href="/signup">Get started <ArrowRight size={16}/></Link></div>
    </nav>

    <section className="heroLanding" id="about">
      <div className="heroCopy">
        <div className="eyebrow"><Sparkles size={15}/> A new social experience</div>
        <h1>Connect. Share.<br/><span>Grow together.</span></h1>
        <p>Qevli is a modern social space for real people, ideas and communities. Share what matters, discover new voices and stay connected — on your terms.</p>
        <div className="heroButtons"><Link className="primaryBtn big" href="/signup">Create your Qevli account <ArrowRight size={18}/></Link><Link className="secondaryBtn big" href="/login">I already have an account</Link></div>
        <div className="trustRow"><span><Lock size={15}/> Privacy first</span><span><Zap size={15}/> Fast & lightweight</span><span><Globe2 size={15}/> Built for everyone</span></div>
      </div>
      <div className="heroVisual">
        <div className="glow one"/><div className="glow two"/>
        <div className="phoneMock">
          <div className="phoneTop"><span>9:41</span><span>● ● ●</span></div>
          <div className="miniBrand"><span className="qIcon small">Q</span> Qevli <span>⌕</span></div>
          <div className="miniWelcome"><b>{['What’s happening?', 'Your people are here.', 'Make the moment yours.'][demoStep]}</b><span>{['Share a moment with your people.', 'See what your community is saying.', 'Post, message and grow together.'][demoStep]}</span></div>
          <div className="miniPost"><div className="miniFeedLabel"><b>{['Your Qevli feed', 'A new conversation', 'Creator studio'][demoStep]}</b><small>{['Real people. Real posts.', 'Private messages, made simple.', 'Publish and understand your audience.'][demoStep]}</small></div><span>•••</span><p>{['See posts, stories and conversations from the people you connect with.', 'Reply to the people who matter, wherever they are.', 'Turn your ideas into posts, stories and videos.'][demoStep]}</p><div className={`miniImage demoImage${demoStep}`} aria-hidden="true"/><div className="miniActions">♥ &nbsp;&nbsp; ◯ &nbsp;&nbsp; ↗</div></div>
          <div className="miniNav"><span>⌂</span><span>⌕</span><strong>+</strong><span>◌</span><span>◉</span></div>
        </div>
        <div className="floatCard cardA"><Users size={18}/><b>Real people</b><small>Connect with your community</small></div>
        <div className="floatCard cardB"><MessageCircle size={18}/><b>Stay connected</b><small>Simple private conversations</small></div>
          <div className="landingGallery" aria-label="Qevli community moments"><div className="landingMoment">Q</div><div className="landingMoment">✦</div><div className="landingMoment">◌</div></div>
      </div>
    </section>

    <section className="featureSection" id="features"><div className="sectionIntro"><div className="eyebrow">Everything starts here</div><h2>Designed around <span>your world.</span></h2><p>A focused first experience with the essentials you expect from a social platform — presented with Qevli’s own identity.</p></div>
      <div className="featureGrid"><Feature icon={<Users/>} title="Your people" text="Build your profile, follow people and create meaningful connections."/><Feature icon={<Sparkles/>} title="Share moments" text="Post thoughts, photos and updates without unnecessary complexity."/><Feature icon={<MessageCircle/>} title="Private messages" text="Have direct one-to-one conversations in a clean, simple space."/><Feature icon={<Lock/>} title="Your privacy" text="Clear privacy controls, safety tools and straightforward policies."/><Feature icon={<Zap/>} title="Fast by design" text="A lightweight interface built with mobile and slower networks in mind."/><Feature icon={<Globe2/>} title="Made to grow" text="A foundation ready for future communities, stories, calls and more."/></div>
    </section>

    <section className="ctaSection"><div><div className="eyebrow">Your Qevli journey</div><h2>Start with a simple hello.</h2><p>Create your account, set up your profile and see what Qevli feels like before the platform grows into its full vision.</p></div><Link className="primaryBtn big" href="/signup">Get started <ArrowRight size={18}/></Link></section>
    <footer><Link href="/" className="brandMark"><span className="qIcon">Q</span><span>Qevli</span></Link><span>© 2026 Qevli. Connect. Share. Grow.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
  </main>
}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <article className="featureCard"><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>}
