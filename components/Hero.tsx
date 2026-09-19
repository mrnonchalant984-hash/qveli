import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock, MessageCircle, Users } from 'lucide-react';

export default function Hero() {
  return (
    <header className="v1Hero">
      <nav className="landingNav" aria-label="Primary navigation">
        <Link href="/" className="brandMark" aria-label="Qevli home">
          <span className="qIcon">Q</span>
          <span>Qevli</span>
        </Link>

        <div className="navLinks">
          <a href="#features">Features</a>
          <a href="#community">Community</a>
          <a href="#about">About</a>
        </div>

        <div className="navActions">
          <Link href="/login" className="navLogin">Log in</Link>
          <Link href="/signup" className="primaryBtn">Create account</Link>
        </div>
      </nav>

      <div className="v1HeroInner">
        <div className="v1HeroCopy">
          <div className="eyebrow">Welcome to Qevli</div>
          <h1>Social built for <span>real connection.</span></h1>
          <p>
            Connect with people, share what matters, and discover communities in a clean,
            simple social space made for everyday life.
          </p>

          <div className="heroButtons">
            <Link href="/signup" className="primaryBtn big">
              Get started <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="secondaryBtn big">Log in</Link>
          </div>

          <div className="v1TrustRow" id="community">
            <span><CheckCircle2 size={16} /> Real people &amp; real connections</span>
            <span><Lock size={16} /> Privacy-first controls</span>
            <span><MessageCircle size={16} /> Simple private messaging</span>
          </div>
        </div>

        <div className="v1WelcomeCard" id="about">
          <div className="v1CardTop">
            <span className="qIcon small">Q</span>
            <span className="v1CardLabel">Qevli</span>
          </div>
          <div className="v1CardBody">
            <div className="v1WelcomeIcon"><Users size={25} /></div>
            <h2>Get started</h2>
            <p>Create your account, set up your profile, and start connecting with the people and communities that matter to you.</p>
            <Link href="/signup" className="primaryBtn v1FullBtn">Create your account <ArrowRight size={16} /></Link>
            <Link href="/login" className="v1CardLogin">Already have an account? <strong>Log in</strong></Link>
          </div>
          <div className="v1CardFooter">
            <span>Built for everyday social connection</span>
            <span>Qevli</span>
          </div>
        </div>
      </div>

      <div className="v1Bottom" id="features">
        <div><strong>People</strong><span>Build your profile and connect.</span></div>
        <div><strong>Share</strong><span>Post text, photos and moments.</span></div>
        <div><strong>Message</strong><span>Keep conversations private.</span></div>
      </div>
    </header>
  );
}
