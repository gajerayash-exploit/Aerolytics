// Turns a stored inference session (from /missions/new → FastAPI) into the view data shape,
// so the twin, report and frame gallery can open real results.
import { getSession } from './store';

const cap = (s) => String(s || '').replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function sessionData(id, D) {
  const s = id ? getSession(id) : null;
  if (!s || !D || !D.P[s.pillar]) return null;
  const k = s.pillar;
  const base = D.P[k];
  const dets = (s.detections || []).map((d, i) => {
    const t = d.telemetry || {};
    const lat = typeof t.lat === 'number' ? t.lat : 22.3;
    const lng = typeof t.lng === 'number' ? t.lng : 70.8;
    const bbox = (d.bbox_xyxy || [0, 0, 0, 0]).map((n) => Math.round(n));
    // local site units (1.5 m) from the frame position, nudged by the box centre so boxes in one frame don't overlap
    const iw = (d.image && d.image.width) || 640, ih = (d.image && d.image.height) || 640;
    const cx = (bbox[0] + bbox[2]) / 2 / iw, cy = (bbox[1] + bbox[3]) / 2 / ih;
    const x = Math.max(-60, Math.min(60, ((lng - 70.8) * 102990) / 1.5 + (cx - 0.5) * 12));
    const z = Math.max(-42, Math.min(42, ((22.3 - lat) * 111320) / 1.5 + (cy - 0.5) * 12));
    const conf = Number(d.confidence) || 0;
    const sev = conf >= 0.75 ? 'crit' : 'warn';
    return {
      id: 'DET-' + s.session.id.slice(-5) + '-' + String(i + 1).padStart(2, '0'),
      x, z, cls: cap(d.class), conf, sev,
      status: 'New', ago: 'this session', loc: d.filename || 'frame ' + (i + 1),
      lat: lat.toFixed(5) + '° N', lon: lng.toFixed(5) + '° E',
      offX: (x * 1.5).toFixed(1), offZ: (-z * 1.5).toFixed(1),
      frame: 'FRM-' + String(i + 1).padStart(4, '0'),
      alt: (Number(t.alt) || 0).toFixed(1) + ' m', hdg: (Number(t.heading) || 0).toFixed(0) + '°',
      bbox, sevLabel: sev === 'crit' ? 'Critical' : 'Warning', sevCls: sev === 'crit' ? 'sev-crit' : 'sev-warn',
      statusCls: 'st-new', confPct: Math.round(conf * 100),
    };
  });
  const P = Object.assign({}, D.P);
  P[k] = Object.assign({}, base, {
    mission: s.session.id,
    site: 'Uploaded mission',
    date: s.session.created_utc.slice(0, 16).replace('T', ' '),
    frames: (s.telemetry && s.telemetry.frames) || dets.length,
    dets,
  });
  return Object.assign({}, D, { P, session: s });
}
