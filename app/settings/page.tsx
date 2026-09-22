'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Accessibility, ArrowLeft, Bell, CheckCircle2, CreditCard, Download, Lock, Shield, Trash2, UserRound, Mail, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({ dataSaver: false, fontScale: 1, highContrast: false });
  const [notifications, setNotifications] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [me,setMe]=useState<any>(null);
  const [theme,setTheme]=useState<'light'|'dark'>('light');
  const [verification,setVerification]=useState('');

  useEffect(() => {
    const saved=(localStorage.getItem('qevli-theme') as 'light'|'dark'|null)||'light'; setTheme(saved); document.documentElement.dataset.theme=saved;
    Promise.all([fetch('/api/settings/platform'), fetch('/api/notifications/preferences')]).then(async ([settingsResponse, notificationResponse]) => {
      if (settingsResponse.ok) setSettings((await settingsResponse.json()).settings || settings);
      if (notificationResponse.ok) setNotifications((await notificationResponse.json()).preferences);
      const meResponse=await fetch('/api/users/me'); if(meResponse.ok)setMe((await meResponse.json()).user);
    });
  }, []);

  const toggleTheme=(next:'light'|'dark')=>{setTheme(next);localStorage.setItem('qevli-theme',next);document.documentElement.dataset.theme=next};
  const requestVerification=async()=>{setVerification('Sending…');const r=await fetch('/api/auth/request-verification',{method:'POST'});const j=await r.json().catch(()=>({}));setVerification(r.ok?(j.sent?'Verification email sent. Check your inbox.':`Email provider is not configured.${j.developmentToken?' Development token: '+j.developmentToken:''}`):(j.error||'Unable to send verification email.'))};

  const saveSettings = async () => {
    const response = await fetch('/api/settings/platform', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setMessage(response.ok ? 'Settings saved.' : 'Unable to save settings.');
  };
  const saveNotification = async (key: string, value: boolean) => {
    const response = await fetch('/api/notifications/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) });
    if (response.ok) setNotifications((await response.json()).preferences);
  };
  const exportData = async () => {
    const response = await fetch('/api/account/export');
    if (!response.ok) { setMessage('Unable to export data.'); return; }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(await response.json(), null, 2)], { type: 'application/json' }));
    link.download = 'qevli-data-export.json'; link.click(); setMessage('Your data export was downloaded.');
  };
  const deleteAccount = async () => {
    const password = window.prompt('Enter your password to permanently delete your Qevli account.');
    if (!password) return;
    const response = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const data = await response.json();
    if (response.ok) window.location.href = '/login'; else setMessage(data.error || 'Account deletion failed.');
  };

  return <main className="simplePage darkPage"><header className="simpleTop"><Link href="/dashboard" className="back"><ArrowLeft size={18}/> Home</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header><div className="simpleWrap narrow"><div className="pageEyebrow">Settings</div><h1>Make Qevli yours.</h1><p className="lead">Real account, privacy, accessibility and notification controls.</p>
    <section className="featureCard darkCard settingsPanel"><h3><Moon size={18}/> Appearance</h3><div className="themeChoices"><button className={theme==='light'?'primaryBtn':'outline'} onClick={()=>toggleTheme('light')}><Sun size={16}/> Light</button><button className={theme==='dark'?'primaryBtn':'outline'} onClick={()=>toggleTheme('dark')}><Moon size={16}/> Dark</button></div></section>
    <section className="featureCard darkCard settingsPanel"><h3><Mail size={18}/> Email verification</h3><p>{me?.email || ''}</p><p>{me?.emailVerifiedAt ? 'Your email is verified.' : 'Verification is optional during signup and can be completed here.'}</p>{!me?.emailVerifiedAt&&<button className="primaryBtn" onClick={requestVerification}>Send verification email</button>}{verification&&<div className="demoNotice">{verification}</div>}</section>
    <section className="settingsCard"><Link className="settingRow" href="/profile"><UserRound size={19}/><span><b>Account</b><small>Profile and personal information</small></span><strong>›</strong></Link><Link className="settingRow" href="/security"><Shield size={19}/><span><b>Security</b><small>Sessions, password and account protection</small></span><strong>›</strong></Link><Link className="settingRow" href="/notifications"><Bell size={19}/><span><b>Notifications</b><small>Manage your Qevli alerts</small></span><strong>›</strong></Link><Link className="settingRow" href="/privacy"><Lock size={19}/><span><b>Privacy</b><small>Read Qevli privacy policy</small></span><strong>›</strong></Link><Link className="settingRow" href="/billing"><CreditCard size={19}/><span><b>Promote your profile</b><small>Buy a one-time visibility campaign for your profile</small></span><strong>›</strong></Link></section>
    <section className="featureCard darkCard settingsPanel"><h3><Accessibility size={18}/> Accessibility & data</h3><label><input type="checkbox" checked={!!settings.dataSaver} onChange={event => setSettings({ ...settings, dataSaver: event.target.checked })}/> Data saver</label><label><input type="checkbox" checked={!!settings.highContrast} onChange={event => setSettings({ ...settings, highContrast: event.target.checked })}/> Higher contrast</label><label>Font scale<select value={settings.fontScale || 1} onChange={event => setSettings({ ...settings, fontScale: Number(event.target.value) })}><option value="0.9">90%</option><option value="1">100%</option><option value="1.1">110%</option></select></label><button className="primaryBtn" onClick={saveSettings}><CheckCircle2 size={16}/> Save settings</button></section>
    {notifications && <section className="featureCard darkCard settingsPanel"><h3><Bell size={18}/> Notifications</h3>{(['likes', 'comments', 'follows', 'messages', 'mentions', 'email'] as const).map(key => <label key={key}><input type="checkbox" checked={!!notifications[key]} onChange={event => saveNotification(key, event.target.checked)}/> {key[0].toUpperCase() + key.slice(1)}</label>)}</section>}
    <section className="featureCard darkCard settingsPanel"><h3>Account data</h3><button className="outline" onClick={exportData}><Download size={16}/> Export my data</button><button className="dangerOutline" onClick={deleteAccount}><Trash2 size={16}/> Delete account</button></section>
    {message && <div className="toast">{message}</div>}
  </div></main>;
}
