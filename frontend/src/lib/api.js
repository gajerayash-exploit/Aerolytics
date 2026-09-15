// Client for the Aerolytics FastAPI backend (backend/main.py).
// Set NEXT_PUBLIC_API_URL to point at it; defaults to a local uvicorn on port 8000.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function withTimeout(promise, ms) {
  let id;
  const timeout = new Promise((_, reject) => { id = setTimeout(() => reject(new Error('timeout')), ms); });
  try { return await Promise.race([promise, timeout]); } finally { clearTimeout(id); }
}

// True when the backend answers (FastAPI always serves /openapi.json).
export async function pingApi() {
  try {
    const res = await withTimeout(fetch(API_URL + '/openapi.json', { cache: 'no-store' }), 2500);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// POST /api/v1/infer/{pillar} with one file. Returns the backend's JSON:
// { pillar, filename, telemetry: {lat, lng, alt, heading}, detections: [{class, confidence, bbox_xyxy}], inference_time_ms }
export async function inferFile(pillar, file) {
  const body = new FormData();
  body.append('file', file, file.name);
  const res = await withTimeout(fetch(API_URL + '/api/v1/infer/' + pillar, { method: 'POST', body }), 120000);
  if (!res.ok) throw new Error('Inference failed: HTTP ' + res.status);
  return res.json();
}

// Forms on the marketing and access pages post here (Next.js route handler).
export async function submitRequest(payload) {
  try {
    const res = await fetch('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return res.ok ? res.json() : null;
  } catch (e) {
    return null;
  }
}
