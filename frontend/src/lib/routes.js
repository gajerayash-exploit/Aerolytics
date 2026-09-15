// Route helpers shared by server pages and client views.
const PREFIX = { EN: 'energy', AG: 'agri', RS: 'rescue' };
const SITE_PILLAR = { rsp: 'energy', gsc: 'energy', kfb: 'agri', kfa: 'agri', lfc: 'agri', ads: 'rescue' };

// AER-EN-0142 → energy · AER-AG-0057 → agri · AER-RS-0019 → rescue · session ids carry the pillar too
export function pillarOf(id) {
  const m = String(id || '').toUpperCase().match(/^AER-(EN|AG|RS)-/);
  return m ? PREFIX[m[1]] : 'energy';
}

export function sitePillar(id) {
  return SITE_PILLAR[String(id || '').toLowerCase()] || 'energy';
}
