import Link from 'next/link';

export default function NotFound() {
  return <main className="simplePage darkPage"><section className="simpleWrap narrow" style={{ textAlign: 'center' }}><div className="pageEyebrow">QEVLI</div><h1>Page not found</h1><p className="lead">That Qevli page does not exist or is no longer available.</p><Link className="primaryBtn" href="/dashboard">Return home</Link></section></main>;
}
