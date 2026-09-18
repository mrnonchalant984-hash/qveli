'use client';
import Link from 'next/link';
import Hero from '@/components/Hero';
import { ArrowRight, Check, Globe2, Lock, MessageCircle, Sparkles, Users, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <main className="landing">
      <Hero />

      <section className="featureSection" id="features">
        <div className="sectionIntro">
          <div className="eyebrow">Everything starts here</div>
          <h2>Designed around <span>your world.</span></h2>
          <p>A focused first experience with the essentials you expect from a social platform — presented with Qevli’s own identity.</p>
        </div>
        <div className="featureGrid">
          <Feature icon={<Users />} title="Your people" text="Build your profile, follow people and create meaningful connections." />
          <Feature icon={<Sparkles />} title="Share moments" text="Post thoughts, photos and updates without unnecessary complexity." />
          <Feature icon={<MessageCircle />} title="Private messages" text="Have direct one-to-one conversations in a clean, simple space." />
          <Feature icon={<Lock />} title="Your privacy" text="Clear privacy controls, safety tools and straightforward policies." />
          <Feature icon={<Zap />} title="Fast by design" text="A lightweight interface built with mobile and slower networks in mind." />
          <Feature icon={<Globe2 />} title="Made to grow" text="A foundation ready for future communities, stories, calls and more." />
        </div>
      </section>

      <section className="ctaSection">
        <div>
          <div className="eyebrow">Your Qevli journey</div>
          <h2>Start with a simple hello.</h2>
          <p>Create your account, set up your profile and see what Qevli feels like before the platform grows into its full vision.</p>
        </div>
        <Link className="primaryBtn big" href="/signup">Get started <ArrowRight size={18} /></Link>
      </section>

      <footer>
        <Link href="/" className="brandMark"><span className="qIcon">Q</span><span>Qevli</span></Link>
        <span>© 2026 Qevli. Connect. Share. Grow.</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="featureCard"><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>;
}
