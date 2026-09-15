// Converts the Claude Design artboards (frontend/design/landing-page) into React views for Next.js.
//
//   node scripts/convert-designs.mjs
//
// For each artboard it emits src/views/<Name>.jsx (a client class component whose render() is the
// artboard markup as JSX) and src/views/css/<Name>.css (the artboard's own styles, scoped under
// .pg-<slug>). Shared styles go to src/styles/design-system.css and shared logic to src/views/_base.jsx.
// Links, navigation buttons and behaviour patches (real API calls, downloads, persistence) are
// applied from scripts/design-patches.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument, DomUtils } from 'htmlparser2';
import { PATCHES, EXTRA_LINKS, EXTRA_BUTTONS } from './design-patches.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design', 'landing-page');
const VIEWS = path.join(ROOT, 'src', 'views');
const read = (f) => fs.readFileSync(path.join(DESIGN, f), 'utf8');

const ARTBOARDS = [
  ['Landing', 'Main.dc.html'], ['Login', 'Login.template.html'], ['Dashboard', 'Dashboard.template.html'],
  ['MissionTwin', 'MissionTwin.template.html'], ['NewInspection', 'NewInspection.template.html'], ['MissionReport', 'MissionReport.template.html'],
  ['MissionsLog', 'MissionsLog.template.html'], ['LiveOps', 'LiveOps.template.html'], ['Analytics', 'Analytics.template.html'],
  ['Sites', 'Sites.template.html'], ['SiteDetail', 'SiteDetail.template.html'], ['Fleet', 'Fleet.template.html'], ['Aircraft', 'Aircraft.template.html'],
  ['MissionPlanner', 'MissionPlanner.template.html'], ['Reports', 'Reports.template.html'], ['Frames', 'Frames.template.html'],
  ['Demo', 'Demo.template.html'], ['Status', 'Status.template.html'], ['SignalLost', 'SignalLost.template.html'],
  ['SettingsProfile', 'SettingsProfile.template.html'], ['SettingsOrganization', 'SettingsOrganization.template.html'],
  ['SettingsTeam', 'SettingsTeam.template.html'], ['SettingsApiKeys', 'SettingsApiKeys.template.html'], ['SettingsModels', 'SettingsModels.template.html'],
  ['AuditLog', 'AuditLog.template.html'], ['Access', 'Access.template.html'], ['Platform', 'Platform.template.html'],
  ['Solutions', 'Solutions.template.html'], ['Company', 'Company.template.html'],
];

// Link text (trimmed, whitespace collapsed) → href expression evaluated in render scope.
const LINKS = Object.assign({
  'Request a pilot': "'/contact'", 'Request a pilot deployment': "'/contact'", 'Request a {{ p.name }} pilot': "'/contact'",
  'See how it works': "'/platform'", 'Platform': "'/platform'", 'Energy': "'/solutions/energy'", 'Agri': "'/solutions/agri'", 'Rescue': "'/solutions/rescue'",
  'Data integrity': "'/platform'", 'Sign in': "'/login'", 'Back to site': "'/'", 'Request access': "'/request-access'", 'Forgot password?': "'/forgot-password'",
  'Back to sign in': "'/login'", 'Open the demo': "'/demo'", 'See it in the demo': "'/demo'",
  '+ New inspection': "'/missions/new'",
  'All missions →': "'/missions'", 'View all detections→': "'/missions/' + v.pc.mission", 'Generate report →': "'/missions/' + v.pc.mission + '/report'",
  '← Back to twin': "'/missions/' + v.pc.mission", '← Mission twin': "'/missions/' + v.pc.mission",
  'Open twin': "'/missions/' + v.cur.id", 'Report': "'/missions/' + v.cur.id + '/report'",
  'Open site →': "'/sites/' + v.cur.key", 'Plan mission': "'/mission-planner'", 'Open aircraft →': "'/fleet/' + v.cur.id",
  'Open full report →': "'/missions/' + v.cur.mission + '/report'", 'All →': "'/missions'",
  'Return to dashboard': "'/dashboard'", 'Open mission log': "'/missions'", 'View system status': "'/status'",
}, EXTRA_LINKS);
const BUTTONS = Object.assign({ 'Continue with organization SSO': "'/login'" }, EXTRA_BUTTONS);

function applyPatches(name, kind, src) {
  const list = (PATCHES[name] && PATCHES[name][kind]) || [];
  for (const [from, to] of list) {
    if (from instanceof RegExp) {
      if (!from.test(src)) throw new Error(`[${name}] ${kind} patch not found: ${from}`);
      from.lastIndex = 0;
      src = src.replace(from, to);
    } else {
      if (!src.includes(from)) throw new Error(`[${name}] ${kind} patch not found: ${from.slice(0, 90)}`);
      src = src.replace(from, () => to);
    }
  }
  return src;
}

// ---------- CSS ----------
function scopeCss(css, scope) {
  let out = '', i = 0;
  const block = () => {
    let depth = 0;
    const start = i;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') { depth--; if (depth === 0) { i++; return css.slice(start + 1, i - 1); } }
    }
    return css.slice(start + 1);
  };
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i); out += css.slice(i, e + 2) + '\n'; i = e + 2; continue; }
    const brace = css.indexOf('{', i);
    if (brace < 0) break;
    const prelude = css.slice(i, brace).trim();
    i = brace;
    const body = block();
    if (prelude.startsWith('@keyframes') || prelude.startsWith('@font-face')) out += prelude + ' {' + body + '}\n';
    else if (prelude.startsWith('@media') || prelude.startsWith('@supports')) out += prelude + ' {\n' + scopeCss(body, scope) + '}\n';
    else {
      const sels = prelude.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
        if (/^(html|body)$/.test(s)) return scope;
        if (s === '*') return scope + ' *';
        return scope + ' ' + s;
      });
      out += Array.from(new Set(sels)).join(', ') + ' {' + body + '}\n';
    }
  }
  return out;
}
const fullHeight = (css) => css.replace(/height:\s*900px/g, 'height: 100vh; min-height: 720px');

// ---------- JSX ----------
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RENAME = { class: 'className', for: 'htmlFor', autocomplete: 'autoComplete', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', colspan: 'colSpan', rowspan: 'rowSpan', crossorigin: 'crossOrigin' };
const BOOL = new Set(['disabled', 'checked', 'readonly', 'required', 'multiple', 'selected', 'autofocus', 'hidden']);
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

function resolve(expr, scope) {
  const e = expr.trim();
  if (/^(true|false|null|undefined)$/.test(e) || /^-?\d+(\.\d+)?$/.test(e) || /^'.*'$/.test(e)) return e;
  const parts = e.split('.');
  const base = scope.has(parts[0]) ? parts[0] : 'v.' + parts[0];
  return [base].concat(parts.slice(1)).join('?.');
}
const hasHole = (s) => /\{\{/.test(s);
function interp(str, scope) {
  let out = '`', last = 0;
  str.replace(HOLE, (m, ex, idx) => { out += str.slice(last, idx).replace(/[`\\$]/g, (c) => '\\' + c) + '${' + resolve(ex, scope) + ' ?? ""}'; last = idx + m.length; return m; });
  return out + str.slice(last).replace(/[`\\$]/g, (c) => '\\' + c) + '`';
}
const wholeHole = (str) => { const m = String(str).match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); return m ? m[1] : null; };

function styleObj(str, scope) {
  const decls = [];
  let depth = 0, cur = '';
  for (const ch of str) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ';' && depth === 0) { decls.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) decls.push(cur);
  const props = decls.map((d) => {
    const k = d.indexOf(':');
    if (k < 0) return null;
    const name = d.slice(0, k).trim(), val = d.slice(k + 1).trim();
    const key = name.startsWith('--') ? JSON.stringify(name) : name.startsWith('-webkit-') ? 'Webkit' + camel(name.slice(8)).replace(/^./, (c) => c.toUpperCase()) : camel(name);
    return key + ': ' + (hasHole(val) ? interp(val, scope) : JSON.stringify(val));
  }).filter(Boolean);
  return '{{ ' + props.join(', ') + ' }}';
}

const textOf = (node) => DomUtils.textContent(node).replace(/\s+/g, ' ').trim();
const state = { imports: new Set(), unmapped: [] };

function attrsJsx(node, scope, name) {
  const out = [];
  const a = node.attribs || {};
  let href = null, isLink = false;
  for (const [raw, val] of Object.entries(a)) {
    if (raw.startsWith('hint-') || raw === 'data-props' || raw === 'data-dc-script') continue;
    let key = RENAME[raw] || raw;
    if (!key.startsWith('data-') && !key.startsWith('aria-') && key.includes('-')) key = camel(key);
    if (raw === 'style') { out.push('style=' + styleObj(val, scope)); continue; }
    if ((name === 'input' || name === 'textarea') && raw === 'value' && !hasHole(val)) key = 'defaultValue';
    if (raw === 'src' && /^(\.\/)?logo-(full|mark)\.png$/.test(val)) { out.push('src="/brand/' + val.replace('./', '') + '"'); continue; }
    if (raw === 'href') { href = val; continue; }
    const whole = wholeHole(val);
    if (whole) out.push(key + '={' + resolve(whole, scope) + '}');
    else if (hasHole(val)) out.push(key + '={' + interp(val, scope) + '}');
    else if (val === '' && BOOL.has(raw)) out.push(key);
    else out.push(key + '=' + JSON.stringify(val));
  }
  if (name === 'a') {
    const text = textOf(node);
    if (href === '#' || href === null) {
      const target = LINKS[text];
      if (target) { isLink = true; out.push('href={' + target + '}'); state.imports.add('Link'); }
      else { out.push('href="#"'); out.push('onClick={(e) => e.preventDefault()}'); state.unmapped.push(text); }
    } else out.push('href=' + JSON.stringify(href));
  }
  if (name === 'button' && !a.onClick) {
    const target = BUTTONS[textOf(node)];
    if (target) out.push('onClick={() => this.go(' + target + ')}');
  }
  return { attrs: out, isLink };
}

function jsx(node, scope, depth) {
  const pad = '  '.repeat(depth);
  if (node.type === 'text') {
    const t = node.data;
    if (!t.trim()) return /\n/.test(t) ? '' : pad + '{" "}';
    let out = '', last = 0;
    t.replace(HOLE, (m, ex, idx) => { const s = t.slice(last, idx); if (s) out += '{' + JSON.stringify(s) + '}'; out += '{' + resolve(ex, scope) + '}'; last = idx + m.length; return m; });
    const rest = t.slice(last);
    if (rest) out += '{' + JSON.stringify(rest) + '}';
    return pad + out;
  }
  if (node.type === 'comment') {
    const c = node.data.trim();
    let m;
    if ((m = c.match(/^RAIL:(\w+)$/))) { state.imports.add('AppRail'); return pad + `<AppRail active="${m[1]}" />`; }
    if ((m = c.match(/^TOPBAR:(.*)$/))) { state.imports.add('TopBar'); return pad + `<TopBar crumbs={${JSON.stringify(m[1].split('|'))}} pillars={v.pillars} />`; }
    if ((m = c.match(/^SETTINGSNAV:([\w-]+)$/))) { state.imports.add('SettingsNav'); return pad + `<SettingsNav active="${m[1]}" />`; }
    if ((m = c.match(/^MKNAV:([\w-]+)$/))) { state.imports.add('MkNav'); return pad + `<MkNav active="${m[1]}" />`; }
    if (c === 'MKFOOT') { state.imports.add('MkFoot'); return pad + '<MkFoot />'; }
    return '';
  }
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return '';
  const name = node.name;
  if (name === 'script' || name === 'style' || name === 'helmet') return '';
  const kids = (sc) => (node.children || []).map((ch) => jsx(ch, sc, depth + 1)).filter(Boolean).join('\n');
  if (name === 'sc-for') {
    const list = wholeHole(node.attribs.list), as = node.attribs.as;
    const sc = new Set(scope); sc.add(as); sc.add('$index');
    return `${pad}{(${resolve(list, scope)} || []).map((${as}, $index) => (\n${pad}  <React.Fragment key={$index}>\n${kids(sc)}\n${pad}  </React.Fragment>\n${pad}))}`;
  }
  if (name === 'sc-if') {
    return `${pad}{${resolve(wholeHole(node.attribs.value), scope)} ? (\n${pad}  <>\n${kids(scope)}\n${pad}  </>\n${pad}) : null}`;
  }
  const { attrs, isLink } = attrsJsx(node, scope, name);
  const tag = isLink ? 'Link' : name;
  const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (VOID.has(name)) return pad + open + ' />';
  const inner = kids(scope);
  if (!inner.trim()) return pad + open + `></${tag}>`;
  return `${pad}${open}>\n${inner}\n${pad}</${tag}>`;
}

// ---------- logic ----------
function convertScript(src) {
  let s = src.replace(/^\s*\/\*SHARED\*\/\s*$/m, '').replace(/^\s*\/\*ENGINE\*\/\s*$/m, '');
  const eStart = s.indexOf('  // ------------------------------------------------------------------\n  // Minimal WebGL engine');
  const eEnd = s.indexOf('  // ------------------------------------------------------------------\n  // HERO');
  if (eStart >= 0 && eEnd > eStart) s = s.slice(0, eStart) + s.slice(eEnd);
  s = s.replace('const E = this._engine();', 'const E = { hero: (c, p) => this._heroScene(this._engine(), c, p), mini: (c, k) => this._miniScene(this._engine(), c, k) };');
  s = s.replace(/class Component extends DCLogic \{/, 'class View extends Base {');
  s = s.replace(/\bComponent\./g, 'View.');
  s = s.replace(/componentDidMount\(\) \{/, 'componentDidMount() {\n    this._syncPillar();');
  return s.trim();
}

function convert(name, file) {
  state.imports.clear();
  const html = applyPatches(name, 'html', read(file));
  const doc = parseDocument(html, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true, decodeEntities: true });
  const xdc = DomUtils.findOne((n) => n.name === 'x-dc', doc.children, true);
  const script = DomUtils.findOne((n) => n.name === 'script' && n.attribs && 'data-dc-script' in n.attribs, doc.children, true);
  const style = DomUtils.findOne((n) => n.name === 'style', doc.children, true);
  const slug = name.replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase());
  const css = (style ? DomUtils.textContent(style) : '').replace('/*SHELL_CSS*/', '').replace('/*SETTINGS_CSS*/', '').replace('/*MARKETING_CSS*/', '');
  fs.writeFileSync(path.join(VIEWS, 'css', name + '.css'), '/* Generated from design/landing-page/' + file + ' — scoped to .pg-' + slug + ' */\n' + fullHeight(scopeCss(css, '.pg-' + slug)));
  const body = (xdc.children || []).map((n) => jsx(n, new Set(), 4)).filter(Boolean).join('\n');
  let logic = convertScript(applyPatches(name, 'js', DomUtils.textContent(script)));
  // Screens built on the shared shell get .ds so the scoped design system applies only to them.
  const usesShell = /\/\*SHELL_CSS\*\//.test(style ? DomUtils.textContent(style) : '');
  const render = `\n\n  render() {\n    const v = this.renderVals();\n    return (\n      <div className="pg-${slug}${usesShell ? ' ds' : ''}">\n${body}\n      </div>\n    );\n  }\n}`;
  logic = logic.replace(/\}\s*$/, render);
  const chrome = ['AppRail', 'TopBar', 'SettingsNav', 'MkNav', 'MkFoot'].filter((c) => state.imports.has(c));
  const head = "'use client';\n/* eslint-disable */\n// Generated by scripts/convert-designs.mjs from design/landing-page/" + file + " — edit the design or the patches, then re-run.\n" +
    "import React from 'react';\n" + (state.imports.has('Link') ? "import Link from 'next/link';\n" : '') +
    "import Base from './_base';\n" + (chrome.length ? 'import { ' + chrome.join(', ') + " } from '@/components/chrome';\n" : '') +
    "import { getPillar, setPillar, readJSON, writeJSON, signIn, signOut, saveSession, downloadFile } from '@/lib/store';\n" +
    "import { API_URL, pingApi, inferFile, submitRequest } from '@/lib/api';\n" +
    "import { sessionData } from '@/lib/session';\n" +
    "import './css/" + name + ".css';\n\n";
  fs.writeFileSync(path.join(VIEWS, name + '.jsx'), head + logic + '\n\nexport default View;\n');
}

function base() {
  let shared = read('shared/shared-logic.js').replace(/\bComponent\._D\b/g, 'Base._D');
  shared = shared.replace('  _data() {', '  __data() {').replace('  _pillarTabs(active, pick) {', '  __pillarTabs(active, pick) {');
  const out = `'use client';
/* eslint-disable */
// Shared view logic generated from design/landing-page/shared/shared-logic.js plus app helpers.
import React from 'react';
import { makeEngine } from '@/lib/gl/engine';
import { getPillar, setPillar } from '@/lib/store';

export default class Base extends React.Component {
  constructor(props) {
    super(props);
    this.go = this.go.bind(this);
    // Tag every scene with its canvas so _loop can skip scenes that are scrolled out of view.
    const names = new Set([...Object.getOwnPropertyNames(Object.getPrototypeOf(this)), ...Object.getOwnPropertyNames(Base.prototype)]);
    names.forEach((n) => {
      if (!/^_[A-Za-z]*Scene$/.test(n) || typeof this[n] !== 'function') return;
      const make = this[n];
      this[n] = (K, canvas, ...rest) => { const sc = make.call(this, K, canvas, ...rest); if (sc && canvas) sc.canvas = canvas; return sc; };
    });
  }

  go(href) {
    if (this.props.router) this.props.router.push(href);
    else window.location.assign(href);
  }

  _engine() { return makeEngine(); }

  // Sample data, or a real inference session when a view sets this._dataOverride.
  _data() { return this._dataOverride || this.__data(); }

  // Re-apply the pillar chosen on another screen (or ?pillar= in the URL) once mounted.
  _syncPillar() {
    setTimeout(() => {
      if (this._alive === false) return;
      const want = this.props.pillar || getPillar();
      if (!want || !this.state || this.state.pillar === undefined || this.state.pillar === want) return;
      const v = this.renderVals();
      const tab = v && v.pillars && v.pillars.find((t) => t.key === want);
      if (tab) tab.pick();
    }, 0);
  }

  _pillarTabs(active, pick) {
    return this.__pillarTabs(active, (k) => { setPillar(k); pick(k); });
  }

${shared}
}
`;
  fs.writeFileSync(path.join(VIEWS, '_base.jsx'), out);
}

fs.mkdirSync(path.join(VIEWS, 'css'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'src', 'styles'), { recursive: true });
base();
for (const [name, file] of ARTBOARDS) convert(name, file);
const ds = ['shared/shell.css', 'shared/settings.css', 'shared/marketing.css'].map((f) => '/* ---- ' + f + ' ---- */\n' + read(f).replace(/^ {4}/gm, '')).join('\n\n');
fs.writeFileSync(path.join(ROOT, 'src', 'styles', 'design-system.css'), '/* Generated from design/landing-page/shared — Aerolytics "Night Ops" design system, scoped to .ds */\n' + fullHeight(scopeCss(ds, '.ds')));
fs.mkdirSync(path.join(ROOT, 'public', 'brand'), { recursive: true });
['logo-full.png', 'logo-mark.png'].forEach((f) => fs.copyFileSync(path.join(DESIGN, f), path.join(ROOT, 'public', 'brand', f)));
console.log('converted ' + ARTBOARDS.length + ' views');
const um = Array.from(new Set(state.unmapped));
if (um.length) console.log('links left inert (' + um.length + '):\n  ' + um.join('\n  '));
