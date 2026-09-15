'use client';
// Shared chrome for the command center and marketing pages: rail, top bar, settings menu,
// marketing nav and footer. Markup mirrors the design canvas; links are real routes.
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/store';

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  missions: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>,
  live: <><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8a6 6 0 010 8.4M7.8 16.2a6 6 0 010-8.4M19 5a10 10 0 010 14M5 19A10 10 0 015 5" /></>,
  analytics: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></>,
  reports: <><path d="M14 3H6v18h12V7l-4-4z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  sites: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  fleet: <><path d="M9 9l6 6M15 9l-6 6" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
};
const Icon = ({ k }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{ICONS[k]}</svg>
);

const NAV = [
  ['dashboard', 'Dashboard', '/dashboard'], ['missions', 'Missions', '/missions'], ['live', 'Live ops', '/live'],
  ['analytics', 'Analytics', '/analytics'], ['reports', 'Reports', '/reports'], ['sites', 'Sites', '/sites'], ['fleet', 'Fleet', '/fleet'],
];

export function AppRail({ active }) {
  return (
    <nav className="rail">
      <Link className="rail-logo" href="/dashboard"><img src="/brand/logo-mark.png" alt="Aerolytics" /></Link>
      {NAV.map(([k, label, href]) => (
        <Link key={k} className={'rail-item' + (k === active ? ' on' : '')} href={href}><Icon k={k} /><span className="rail-tip">{label}</span></Link>
      ))}
      <div className="rail-spacer" />
      <Link className={'rail-item' + (active === 'settings' ? ' on' : '')} href="/settings/profile"><Icon k="settings" /><span className="rail-tip">Settings</span></Link>
      <Link className="avatar" href="/settings/profile" title="Profile">RK</Link>
    </nav>
  );
}

function Clock() {
  const [now, setNow] = useState('--:--:-- UTC');
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="clock">{now}</span>;
}

export function TopBar({ crumbs, pillars }) {
  return (
    <header className="top">
      <div className="crumbs">
        {crumbs.map((c, i) => (i === crumbs.length - 1
          ? <b key={i}>{c}</b>
          : <React.Fragment key={i}><span>{c}</span><span>/</span></React.Fragment>))}
      </div>
      {pillars && pillars.length ? (
        <div className="switch">
          {pillars.map((p) => (
            <button key={p.key} className={'seg ' + p.cls} onClick={p.pick}>
              <i className="dia" style={{ background: p.color }} /><small>{p.idx}</small>{p.name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="top-right">
        <Link className="search" href="/missions">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#62738F" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <span>Search missions, detections…</span><kbd>⌘K</kbd>
        </Link>
        <span className="badge b-sim">Simulated · Golden demo</span>
        <Clock />
        <Link className="bell" href="/dashboard" title="Priority alerts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z" /><path d="M10 20.5a2 2 0 004 0" /></svg><b>6</b>
        </Link>
      </div>
    </header>
  );
}

const SNAV = [['profile', 'Profile', '/settings/profile'], ['organization', 'Organization', '/settings/organization'], ['team', 'Team & roles', '/settings/team'], ['api-keys', 'API keys & integrations', '/settings/api-keys'], ['models', 'Models', '/settings/models'], ['audit', 'Audit log', '/audit-log']];

export function SettingsNav({ active }) {
  const router = useRouter();
  const out = () => { signOut(); router.push('/login'); };
  return (
    <nav className="snav">
      <div className="lbl snav-h">Settings</div>
      {SNAV.map(([k, label, href]) => (
        <Link key={k} className={'snav-i' + (k === active ? ' on' : '')} href={href}><i className="dia" />{label}</Link>
      ))}
      <div className="snav-foot">
        Workspace · [ORGANIZATION]<br />Demo environment
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={out}>Sign out</button>
      </div>
    </nav>
  );
}

const MKLINKS = [['platform', 'Platform', '/platform'], ['solutions', 'Solutions', '/solutions/energy'], ['about', 'About', '/about'], ['contact', 'Contact', '/contact']];

export function MkNav({ active }) {
  const path = usePathname() || '';
  const current = active === 'about' && path.startsWith('/contact') ? 'contact' : active;
  return (
    <header className="mk-nav">
      <Link href="/"><span className="lockup mk-logo"><img src="/brand/logo-mark.png" alt="" /><b>Aerolytics</b></span></Link>
      <nav className="mk-links">
        {MKLINKS.map(([k, l, href]) => <Link key={k} className={k === current ? 'on' : ''} href={href}>{l}</Link>)}
      </nav>
      <div className="mk-nav-r"><Link className="btn btn-ghost" href="/login">Sign in</Link><Link className="btn btn-primary" href="/contact">Request a pilot</Link></div>
    </header>
  );
}

export function MkFoot() {
  return (
    <>
      <section className="mk-cta-band">
        <img src="/brand/logo-mark.png" alt="" />
        <h2 className="mk-h2" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>Put Aerolytics over your site.</h2>
        <p className="mk-p" style={{ textAlign: 'center', margin: '16px auto 0' }}>Start with a pilot mission over a solar plant, a farm, or a response zone.</p>
        <div className="mk-cta" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" href="/contact">Request a pilot</Link><Link className="btn btn-ghost" href="/demo">Open the demo</Link></div>
      </section>
      <footer className="mk-foot">
        <span className="lockup"><img src="/brand/logo-mark.png" alt="" /><b>Aerolytics</b></span>
        <span>© 2026 Aerolytics · Drone Intelligence Engine</span>
        <nav>{MKLINKS.map(([k, l, href]) => <Link key={k} href={href}>{l}</Link>)}<Link href="/status">Status</Link></nav>
      </footer>
    </>
  );
}
