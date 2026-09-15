// Small client-side persistence for the demo: selected pillar, sign-in session, settings and
// inference sessions produced by /missions/new. Everything lives in localStorage (and a cookie for
// the sign-in flag so the proxy can protect command-center routes).
const PILLARS = ['energy', 'agri', 'rescue'];

const safe = (fn, fallback) => {
  try { return fn(); } catch (e) { return fallback; }
};

export function getPillar() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search).get('pillar');
  if (PILLARS.includes(q)) return q;
  const s = safe(() => window.localStorage.getItem('aero.pillar'), null);
  return PILLARS.includes(s) ? s : null;
}

export function setPillar(p) {
  if (!PILLARS.includes(p)) return;
  safe(() => window.localStorage.setItem('aero.pillar', p));
}

export function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  return safe(() => { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }, fallback);
}

export function writeJSON(key, value) {
  safe(() => window.localStorage.setItem(key, JSON.stringify(value)));
}

export function signIn() {
  document.cookie = 'aero_session=demo; path=/; max-age=' + 60 * 60 * 12 + '; samesite=lax';
}

export function signOut() {
  document.cookie = 'aero_session=; path=/; max-age=0; samesite=lax';
}

export function saveSession(session) {
  const all = readJSON('aero.sessions', {});
  all[session.session.id] = session;
  writeJSON('aero.sessions', all);
}

export function getSession(id) {
  const all = readJSON('aero.sessions', {});
  return all[id] || null;
}

export function listSessions() {
  return Object.values(readJSON('aero.sessions', {}));
}

export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type: type || 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
