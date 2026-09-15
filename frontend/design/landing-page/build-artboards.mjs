// Builds <Name>.dc.html artboards from <Name>.template.html.
// Injects: shared shell CSS, the left rail, the top bar, and shared component logic
// (WebGL engine copied from Main.dc.html + shared/shared-logic.js).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');

// --- WebGL engine from the landing page ---
const main = read('./Main.dc.html');
const start = main.indexOf('  // ------------------------------------------------------------------\n  // Minimal WebGL engine');
const end = main.indexOf('  // ------------------------------------------------------------------\n  // HERO');
if (start < 0 || end < 0) throw new Error('engine markers not found in Main.dc.html');
const hook = '    return { hero: (c, p) => self._heroScene(K, c, p), mini: (c, k) => self._miniScene(K, c, k) };';
let engine = main.slice(start, end);
if (!engine.includes(hook)) throw new Error('engine return hook not found');
engine = engine.replace(hook, '    return K;').trimEnd();

const shellCss = read('./shared/shell.css').trimEnd();
const sharedLogic = existsSync(here('./shared/shared-logic.js')) ? read('./shared/shared-logic.js').trimEnd() : '';

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>',
  missions: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"></path><path d="M9 4v14M15 6v14"></path>',
  live: '<circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8a6 6 0 010 8.4M7.8 16.2a6 6 0 010-8.4M19 5a10 10 0 010 14M5 19A10 10 0 015 5"></path>',
  analytics: '<path d="M3 3v18h18"></path><path d="M7 15l4-5 3 3 5-7"></path>',
  reports: '<path d="M14 3H6v18h12V7l-4-4z"></path><path d="M14 3v4h4M9 13h6M9 17h6"></path>',
  sites: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle>',
  fleet: '<path d="M9 9l6 6M15 9l-6 6"></path><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle>',
  settings: '<circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path>',
};
const svg = (k) => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + ICONS[k] + '</svg>';
const NAV = [['dashboard', 'Dashboard'], ['missions', 'Missions'], ['live', 'Live ops'], ['analytics', 'Analytics'], ['reports', 'Reports'], ['sites', 'Sites'], ['fleet', 'Fleet']];

function rail(active) {
  const items = NAV.map(([k, label]) =>
    '      <a class="rail-item' + (k === active ? ' on' : '') + '" href="#">' + svg(k) + '<span class="rail-tip">' + label + '</span></a>').join('\n');
  return '<nav class="rail">\n' +
    '      <a class="rail-logo" href="#"><img src="logo-mark.png" alt="Aerolytics"></a>\n' + items + '\n' +
    '      <div class="rail-spacer"></div>\n' +
    '      <a class="rail-item' + (active === 'settings' ? ' on' : '') + '" href="#">' + svg('settings') + '<span class="rail-tip">Settings</span></a>\n' +
    '      <div class="avatar">RK</div>\n' +
    '    </nav>';
}

function topbar(crumbs) {
  const parts = crumbs.split('|');
  const trail = parts.map((c, i) => (i === parts.length - 1 ? '<b>' + c + '</b>' : '<span>' + c + '</span><span>/</span>')).join('');
  return '<header class="top">\n' +
    '      <div class="crumbs">' + trail + '</div>\n' +
    '      <div class="switch">\n' +
    '        <sc-for list="{{ pillars }}" as="p" hint-placeholder-count="3">\n' +
    '          <button class="seg {{ p.cls }}" onClick="{{ p.pick }}"><i class="dia" style="background: {{ p.color }}"></i><small>{{ p.idx }}</small>{{ p.name }}</button>\n' +
    '        </sc-for>\n' +
    '      </div>\n' +
    '      <div class="top-right">\n' +
    '        <div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#62738F" stroke-width="1.6"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg><span>Search missions, detections…</span><kbd>⌘K</kbd></div>\n' +
    '        <span class="badge b-sim">Simulated · Golden demo</span>\n' +
    '        <span class="clock" data-clock="utc">--:--:-- UTC</span>\n' +
    '        <a class="bell" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z"></path><path d="M10 20.5a2 2 0 004 0"></path></svg><b>6</b></a>\n' +
    '      </div>\n' +
    '    </header>';
}

const settingsCss = existsSync(here('./shared/settings.css')) ? read('./shared/settings.css').trimEnd() : '';
const SNAV = [['profile', 'Profile'], ['organization', 'Organization'], ['team', 'Team & roles'], ['api-keys', 'API keys & integrations'], ['models', 'Models'], ['audit', 'Audit log']];
function settingsNav(active) {
  return '<nav class="snav">\n' +
    '        <div class="lbl snav-h">Settings</div>\n' +
    SNAV.map(([k, label]) => '        <a class="snav-i' + (k === active ? ' on' : '') + '" href="#"><i class="dia"></i>' + label.replace('&', '&amp;') + '</a>').join('\n') + '\n' +
    '        <div class="snav-foot">Workspace · [ORGANIZATION]<br>Demo environment</div>\n' +
    '      </nav>';
}

// Marketing pages: shared nav + footer
const marketingCss = existsSync(here('./shared/marketing.css')) ? read('./shared/marketing.css').trimEnd() : '';
const MKLINKS = [['platform', 'Platform'], ['solutions', 'Solutions'], ['about', 'About'], ['contact', 'Contact']];
function mkNav(active) {
  return '<header class="mk-nav">\n' +
    '    <a href="#"><span class="lockup mk-logo"><img src="logo-mark.png" alt=""><b>Aerolytics</b></span></a>\n' +
    '    <nav class="mk-links">' + MKLINKS.map(([k, l]) => '<a class="' + (k === active ? 'on' : '') + '" href="#">' + l + '</a>').join('') + '</nav>\n' +
    '    <div class="mk-nav-r"><a class="btn btn-ghost" href="#">Sign in</a><a class="btn btn-primary" href="#">Request a pilot</a></div>\n' +
    '  </header>';
}
function mkFoot() {
  return '<section class="mk-cta-band">\n' +
    '    <img src="logo-mark.png" alt="">\n' +
    '    <h2 class="mk-h2" style="text-align: center; margin-left: auto; margin-right: auto">Put Aerolytics over your site.</h2>\n' +
    '    <p class="mk-p" style="text-align: center; margin: 16px auto 0">Start with a pilot mission over a solar plant, a farm, or a response zone.</p>\n' +
    '    <div class="mk-cta" style="justify-content: center"><a class="btn btn-primary" href="#">Request a pilot</a><a class="btn btn-ghost" href="#">Open the demo</a></div>\n' +
    '  </section>\n' +
    '  <footer class="mk-foot"><span class="lockup"><img src="logo-mark.png" alt=""><b>Aerolytics</b></span><span>© 2026 Aerolytics · Drone Intelligence Engine</span><nav>' +
    MKLINKS.map(([, l]) => '<a href="#">' + l + '</a>').join('') + '<a href="#">Status</a></nav></footer>';
}

const names = process.argv.slice(2);
if (!names.length) throw new Error('usage: node build-artboards.mjs Dashboard MissionTwin ...');
for (const name of names) {
  let tpl = read('./' + name + '.template.html');
  tpl = tpl.replace('/*SHELL_CSS*/', shellCss);
  tpl = tpl.replace('/*SETTINGS_CSS*/', settingsCss);
  tpl = tpl.replace(/<!--SETTINGSNAV:([\w-]+)-->/, (_, k) => settingsNav(k));
  tpl = tpl.replace('/*MARKETING_CSS*/', marketingCss);
  tpl = tpl.replace(/<!--MKNAV:([\w-]+)-->/, (_, k) => mkNav(k));
  tpl = tpl.replace('<!--MKFOOT-->', mkFoot());
  tpl = tpl.replace(/<!--RAIL:(\w+)-->/, (_, k) => rail(k));
  tpl = tpl.replace(/<!--TOPBAR:([^>]*)-->/, (_, c) => topbar(c));
  if (tpl.includes('/*SHARED*/')) tpl = tpl.replace('  /*SHARED*/', engine + '\n\n' + sharedLogic);
  if (tpl.includes('/*ENGINE*/')) tpl = tpl.replace('  /*ENGINE*/', engine);
  if (/\/\*(SHELL_CSS|SHARED|ENGINE)\*\/|<!--(RAIL|TOPBAR):/.test(tpl)) throw new Error(name + ': unresolved placeholder');
  writeFileSync(here('./' + name + '.dc.html'), tpl);
  console.log('built ' + name + '.dc.html');
}
