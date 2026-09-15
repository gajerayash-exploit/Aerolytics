  // ==================================================================
  // SHARED — sample mission data (golden demo), pillar tabs, UTC clock,
  // and the reusable 3D site twin used by /dashboard and /missions/[id].
  // All values here are SAMPLE DATA and are labelled as such on screen.
  // ==================================================================
  _data() {
    if (Component._D) return Component._D;
    const latN = (z) => 22.3 - (z * 1.5) / 111320;
    const lonE = (x) => 70.8 + (x * 1.5) / 102990;
    const finish = (list, prefix, statuses, frames) => list.map((q, i) => {
      const n = String(i + 1).padStart(2, '0');
      const st = statuses.indexOf(q.status);
      return Object.assign(q, {
        id: 'DET-' + prefix + '-' + n,
        lat: latN(q.z).toFixed(5) + '° N',
        lon: lonE(q.x).toFixed(5) + '° E',
        offX: (q.x * 1.5).toFixed(1),
        offZ: (-q.z * 1.5).toFixed(1),
        frame: 'FRM-' + String(frames[i]).padStart(4, '0'),
        alt: '42.0 m',
        hdg: i % 2 ? '270°' : '090°',
        bbox: [412 + i * 37, 228 + i * 21, 538 + i * 37, 341 + i * 21],
        sevLabel: q.sev === 'crit' ? 'Critical' : 'Warning',
        sevCls: q.sev === 'crit' ? 'sev-crit' : 'sev-warn',
        statusCls: ['st-new', 'st-assigned', 'st-resolved'][Math.max(0, st)],
        confPct: Math.round(q.conf * 100),
      });
    });
    const energy = finish([
      [2, 4, 'Crack', 0.91, 'crit', 'New', '2 min ago'],
      [4, 13, 'Hotspot', 0.87, 'crit', 'New', '4 min ago'],
      [10, 17, 'Crack', 0.83, 'crit', 'Assigned', '9 min ago'],
      [6, 20, 'Dust', 0.78, 'warn', 'New', '6 min ago'],
      [8, 7, 'Cover', 0.72, 'warn', 'Resolved', '11 min ago'],
      [13, 2, 'Dust', 0.66, 'warn', 'Assigned', '14 min ago'],
    ].map(([r, c, cls, conf, sev, status, ago]) => ({
      x: -57.5 + c * 5.2, z: -38.5 + r * 5.5, cls, conf, sev, status, ago,
      loc: 'Row ' + String(r + 1).padStart(2, '0') + ' · Panel ' + String(c + 1).padStart(2, '0'),
    })), 'EN', ['New', 'Assigned', 'Resolved'], [231, 118, 402, 176, 297, 455]);
    const agri = finish([
      [-34, -20, 'Leaf rust', 0.88, 'crit', 'New', '3 min ago', 'Cell C-07 · 0.42 ha'],
      [18, -8, 'Leaf blight', 0.81, 'crit', 'New', '5 min ago', 'Cell H-11 · 0.36 ha'],
      [-12, 22, 'Blast', 0.79, 'crit', 'Assigned', '8 min ago', 'Cell E-17 · 0.51 ha'],
      [42, 14, 'Brown spots', 0.74, 'warn', 'New', '10 min ago', 'Cell M-15 · 0.21 ha'],
      [-48, 6, 'Leaf rust', 0.69, 'warn', 'Resolved', '16 min ago', 'Cell A-12 · 0.18 ha'],
    ].map(([x, z, cls, conf, sev, status, ago, loc]) => ({ x, z, cls, conf, sev, status, ago, loc })),
    'AG', ['New', 'Assigned', 'Resolved'], [64, 139, 251, 188, 297]);
    const rescue = finish([
      [-40, -30, 'Person', 0.93, 'crit', 'New', '1 min ago', 'Target T-01 · open ground'],
      [-6, -14, 'Person', 0.88, 'crit', 'Dispatched', '3 min ago', 'Target T-02 · near debris'],
      [-2.5, -10.5, 'Person', 0.81, 'crit', 'Dispatched', '3 min ago', 'Target T-03 · near debris'],
      [48, 26, 'Person', 0.84, 'crit', 'New', '6 min ago', 'Target T-05 · embankment'],
      [30, 4, 'Person', 0.76, 'warn', 'Confirmed', '9 min ago', 'Target T-04 · structure'],
      [-30, 31, 'Person', 0.71, 'warn', 'New', '12 min ago', 'Target T-06 · tree line'],
    ].map(([x, z, cls, conf, sev, status, ago, loc]) => ({ x, z, cls, conf, sev, status, ago, loc })),
    'RS', ['New', 'Dispatched', 'Confirmed'], [22, 71, 72, 166, 121, 190]);

    const P = {
      energy: {
        key: 'energy', idx: '01', name: 'Energy', long: 'Solar intelligence', color: '#5CE1FF', chip: 'c-energy', thumb: 'th-energy',
        site: 'Rajkot Solar Park', mission: 'AER-EN-0142', date: '14 Sep 2026 14:05', model: 'solar_best.pt', frames: 486, overlay: 'Thermal overlay',
        classesLbl: 'Detections by class', unit: 'Panel',
        kpis: [
          { k: 'Panels inspected', v: '2,184', of: '/ 2,400', note: '+312 since last mission', viz: 'bar', pct: 91, badge: 'Manifest', bcls: 'b-man' },
          { k: 'Total detections', v: '37', of: '', note: '6 priority shown on twin', viz: 'hist', badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Critical alerts', v: '6', of: '', note: '3 unassigned', viz: 'dia', n: 6, crit: true, badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Inspection coverage', v: '91%', of: '', note: 'Lane 7 / 7 complete', viz: 'ring', pct: 91, badge: 'Manifest', bcls: 'b-man' },
        ],
        classes: [['Crack', 12, 'crit'], ['Dust', 14, 'warn'], ['Hotspot', 6, 'crit'], ['Cover', 5, 'warn']],
        dets: energy,
      },
      agri: {
        key: 'agri', idx: '02', name: 'Agri', long: 'Crop health', color: '#9BE15D', chip: 'c-agri', thumb: 'th-agri',
        site: 'Kalawad Rd Farm Block B', mission: 'AER-AG-0057', date: '11 Sep 2026 07:15', model: 'agri_best.pt', frames: 340, overlay: 'NDVI-style overlay',
        classesLbl: 'Detections by class', unit: 'Cell',
        kpis: [
          { k: 'Field area scanned', v: '42.6', of: 'ha / 48 ha', note: 'Block B, 7 lanes', viz: 'bar', pct: 89, badge: 'EXIF', bcls: 'b-exif' },
          { k: 'Affected area', v: '3.8', of: 'ha · est.', note: 'NDVI-style estimate', viz: 'ndvi', badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Disease zones', v: '5', of: '', note: '2 spreading east', viz: 'dia', n: 5, crit: true, badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Mean health index', v: '0.62', of: '', note: 'NDVI-inspired, not calibrated', viz: 'ring', pct: 62, badge: 'Simulated', bcls: 'b-sim' },
        ],
        classes: [['Leaf rust', 9, 'crit'], ['Leaf blight', 6, 'crit'], ['Blast', 4, 'crit'], ['Brown spots', 7, 'warn']],
        dets: agri,
      },
      rescue: {
        key: 'rescue', idx: '03', name: 'Rescue', long: 'Thermal search', color: '#FF7A4D', chip: 'c-rescue', thumb: 'th-rescue',
        site: 'Aji Dam Sector 3', mission: 'AER-RS-0019', date: '09 Sep 2026 22:48', model: 'thermal_best.pt', frames: 208, overlay: 'LWIR overlay',
        classesLbl: 'Detections by type', unit: 'Target',
        kpis: [
          { k: 'Persons detected', v: '6', of: '', note: '4 priority targets', viz: 'dia', n: 6, crit: true, badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Teams dispatched', v: '2', of: '/ 3', note: 'Exercise · simulated', viz: 'hist', badge: 'Simulated', bcls: 'b-sim' },
          { k: 'Search area covered', v: '1.9', of: 'km² / 2.4', note: 'Thermal sweep, 7 lanes', viz: 'bar', pct: 79, badge: 'Manifest', bcls: 'b-man' },
          { k: 'Since last sighting', v: '04:12', of: 'min', note: 'T-01 · 22.30040° N', viz: 'ring', pct: 35, badge: 'Simulated', bcls: 'b-sim' },
        ],
        classes: [['Person', 6, 'crit'], ['Vehicle · planned', 0, 'warn']],
        dets: rescue,
      },
    };
    const missions = [
      { id: 'AER-EN-0143', site: 'Rajkot Solar Park', pillar: 'energy', date: '14 Sep 2026 15:10', frames: 212, det: '—', tele: 'Simulated', tcls: 'b-sim', status: 'Processing', pct: 64 },
      { id: 'AER-EN-0142', site: 'Rajkot Solar Park', pillar: 'energy', date: '14 Sep 2026 14:05', frames: 486, det: '6 / 37', tele: 'Simulated', tcls: 'b-sim', status: 'Complete', pct: 100 },
      { id: 'AER-AG-0057', site: 'Kalawad Rd Farm Block B', pillar: 'agri', date: '11 Sep 2026 07:15', frames: 340, det: '5 / 26', tele: 'EXIF', tcls: 'b-exif', status: 'Complete', pct: 100 },
      { id: 'AER-RS-0019', site: 'Aji Dam Sector 3', pillar: 'rescue', date: '09 Sep 2026 22:48', frames: 208, det: '4 / 6', tele: 'Manifest', tcls: 'b-man', status: 'Complete', pct: 100 },
      { id: 'AER-EN-0139', site: 'Rajkot Solar Park', pillar: 'energy', date: '07 Sep 2026 10:02', frames: 498, det: '—', tele: 'EXIF', tcls: 'b-exif', status: 'Failed', pct: 0 },
      { id: 'AER-AG-0055', site: 'Kalawad Rd Farm Block A', pillar: 'agri', date: '05 Sep 2026 06:50', frames: 362, det: '1 / 11', tele: 'EXIF', tcls: 'b-exif', status: 'Complete', pct: 100 },
    ];
    // Sites in area-of-operations map units (≈ 150 m per unit around Rajkot) — sample
    const sites = [
      { key: 'rsp', name: 'Rajkot Solar Park', short: 'Solar Park', pillar: 'energy', x: 0, z: 0 },
      { key: 'gsc', name: 'Gondal Rd Solar Canopy', short: 'Gondal Rd Canopy', pillar: 'energy', x: 42, z: 48 },
      { key: 'kfb', name: 'Kalawad Rd Farm Block B', short: 'Farm Block B', pillar: 'agri', x: -58, z: -26 },
      { key: 'kfa', name: 'Kalawad Rd Farm Block A', short: 'Farm Block A', pillar: 'agri', x: -72, z: -4 },
      { key: 'lfc', name: 'Lodhika Farm Cluster', short: 'Lodhika Cluster', pillar: 'agri', x: -44, z: 58 },
      { key: 'ads', name: 'Aji Dam Sector 3', short: 'Aji Dam S3', pillar: 'rescue', x: 58, z: -46 },
    ];
    const older = [
      ['AER-EN-0138', 'Gondal Rd Solar Canopy', 'energy', '03 Sep 2026 16:20', 356, '2 / 14', 'EXIF', 'Complete'],
      ['AER-RS-0018', 'Aji Dam Sector 3', 'rescue', '01 Sep 2026 23:05', 190, '1 / 2', 'Simulated', 'Complete'],
      ['AER-AG-0054', 'Lodhika Farm Cluster', 'agri', '30 Aug 2026 07:40', 402, '3 / 21', 'EXIF', 'Complete'],
      ['AER-EN-0137', 'Rajkot Solar Park', 'energy', '28 Aug 2026 11:15', 505, '5 / 33', 'Manifest', 'Complete'],
      ['AER-AG-0053', 'Kalawad Rd Farm Block B', 'agri', '25 Aug 2026 06:55', 338, '0 / 9', 'EXIF', 'Complete'],
      ['AER-EN-0136', 'Gondal Rd Solar Canopy', 'energy', '22 Aug 2026 15:30', 349, '—', 'Manifest', 'Failed'],
      ['AER-RS-0017', 'Aji Dam Sector 3', 'rescue', '19 Aug 2026 21:10', 176, '2 / 3', 'Simulated', 'Complete'],
      ['AER-EN-0135', 'Rajkot Solar Park', 'energy', '16 Aug 2026 10:45', 498, '3 / 27', 'EXIF', 'Complete'],
    ].map(([id, site, pillar, date, frames, det, tele, status]) => ({
      id, site, pillar, date, frames, det, tele, status,
      tcls: tele === 'EXIF' ? 'b-exif' : tele === 'Manifest' ? 'b-man' : 'b-sim', pct: status === 'Complete' ? 100 : 0,
    }));
    const missionsAll = missions.concat(older).map((m, i) => {
      const site = sites.find((s) => s.name === m.site) || sites[0];
      const secs = Math.round(m.frames * 1.77);
      return Object.assign({}, m, {
        siteKey: site.key,
        duration: String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0'),
        coverage: m.status === 'Complete' ? 86 + ((i * 7) % 14) : m.status === 'Processing' ? m.pct : 41,
        operator: 'Ops-' + ((i % 3) + 1),
        aircraft: m.tele === 'Simulated' ? 'DEMO-01 · simulated' : 'Quad-' + String((i % 2) + 1).padStart(2, '0'),
      });
    });
    const siteExtra = {
      rsp: ['48.2 ha', '2,400 panels', 'AER-EN-0142', 6, '21 Sep 2026', 82],
      gsc: ['6.4 ha', '610 panels', 'AER-EN-0138', 2, '28 Sep 2026', 91],
      kfb: ['48 ha', 'Wheat · rabi season', 'AER-AG-0057', 5, '18 Sep 2026', 71],
      kfa: ['36 ha', 'Groundnut', 'AER-AG-0055', 1, '25 Sep 2026', 88],
      lfc: ['112 ha', 'Mixed crops', 'AER-AG-0054', 3, '02 Oct 2026', 79],
      ads: ['2.4 km²', 'Flood-risk response zone', 'AER-RS-0019', 4, 'On call', 64],
    };
    sites.forEach((s) => { const e = siteExtra[s.key]; Object.assign(s, { area: e[0], assets: e[1], lastMission: e[2], open: e[3], next: e[4], health: e[5], lat: (22.3 - s.z * 0.00135).toFixed(4) + '° N', lon: (70.8 + s.x * 0.00146).toFixed(4) + '° E' }); });
    // Sample fleet — airframe models and firmware are placeholders until real aircraft are registered
    const fleet = [
      { id: 'DEMO-01', name: 'Golden demo quad', model: 'Simulated airframe', status: 'In flight', scls: 'st-new', payload: 'RGB 4K · simulated', pillar: 'energy', hours: '—', cycles: '—', firmware: 'sim-1.0', maint: '—', batt: 78, link: 'Simulated', sim: true, motors: [0, 0, 0, 0] },
      { id: 'QUAD-01', name: 'Survey quad', model: '[AIRFRAME MODEL]', status: 'Ready', scls: 'st-resolved', payload: 'RGB 20 MP', pillar: 'energy', hours: '142.6 h', cycles: '212', firmware: '[FIRMWARE]', maint: '02 Sep 2026', batt: 100, link: 'Not linked', sim: false, motors: [142, 141, 143, 142] },
      { id: 'QUAD-02', name: 'Multispectral quad', model: '[AIRFRAME MODEL]', status: 'Maintenance', scls: 'st-warn', payload: 'Multispectral 5-band', pillar: 'agri', hours: '96.1 h', cycles: '148', firmware: '[FIRMWARE]', maint: 'Due now', batt: 0, link: 'Not linked', sim: false, motors: [96, 97, 131, 95] },
      { id: 'THERM-01', name: 'Thermal quad', model: '[AIRFRAME MODEL]', status: 'Offline', scls: 'st-off', payload: 'LWIR 640×512 + RGB', pillar: 'rescue', hours: '61.4 h', cycles: '90', firmware: '[FIRMWARE]', maint: '18 Aug 2026', batt: 34, link: 'Not linked', sim: false, motors: [61, 62, 61, 60] },
    ];
    Component._D = { P, missions, missionsAll, sites, fleet };
    return Component._D;
  }

  _pillarTabs(active, pick) {
    const D = this._data();
    return ['energy', 'agri', 'rescue'].map((k) => ({
      key: k, idx: D.P[k].idx, name: D.P[k].name, color: D.P[k].color, cls: k === active ? 'on' : '', pick: () => pick(k),
    }));
  }

  _startClock() {
    const tick = () => document.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = new Date().toISOString().slice(11, 19) + ' UTC'; });
    tick();
    this._clockId = setInterval(tick, 1000);
  }

  _stopClock() { if (this._clockId) clearInterval(this._clockId); }

  _loop(scenes) {
    let last = performance.now();
    const t0 = last;
    // Offscreen canvases don't render: scenes get .canvas from the constructor wrapper.
    const hidden = new Set();
    if (typeof IntersectionObserver !== 'undefined') {
      this._io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? hidden.delete(e.target) : hidden.add(e.target))), { rootMargin: '100px' });
      scenes.forEach((s) => s && s.canvas && this._io.observe(s.canvas));
    }
    const step = (now) => {
      if (!this._alive) { if (this._io) this._io.disconnect(); return; }
      // rAF timestamps can precede the performance.now() taken at start; never pass negative time
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (!document.hidden) scenes.forEach((s) => s && !hidden.has(s.canvas) && s.frame(Math.max(0, now - t0) / 1000, dt));
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Site twin. o = { pillar, mode: 'overview'|'mission', labelsEl, onPick(id|null), onHud(h) }
  // ------------------------------------------------------------------
  _twinScene(K, canvas, o) {
    const R = K.renderer(canvas, [0.016, 0.043, 0.11]);
    if (!R) return null;
    const { Batch, COL, a, lerp, clamp, smooth } = K;
    const D = this._data();

    const ground = (x, z) => {
      const base = 9 * Math.sin(x * 0.028 + 1.3) * Math.cos(z * 0.024) + 4.5 * Math.sin(x * 0.07 + z * 0.05) + 2.2 * Math.cos(z * 0.11 - x * 0.045);
      const m = smooth(58, 125, Math.hypot(x / 1.25, z));
      return base * (0.08 + 0.92 * m) + m * m * 18;
    };
    const LANES = 7, X0 = -56, X1 = 56, Z0 = -36, DZ = 12, ALT = 28, SPEED = 19;
    const wps = [];
    for (let i = 0; i < LANES; i++) {
      const z = Z0 + i * DZ;
      if (i % 2 === 0) wps.push([X0, z, i], [X1, z, i]); else wps.push([X1, z, i], [X0, z, i]);
    }
    wps.push([X1 + 18, Z0 + (LANES - 1) * DZ, -1], [X1 + 18, Z0 - 18, -1], [X0, Z0 - 18, -1], [X0, Z0, -1]);
    const segs = [];
    let total = 0, laneEnd = 0;
    for (let i = 0; i < wps.length - 1; i++) {
      const p = wps[i], q = wps[i + 1], len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const lane = p[2] >= 0 && p[2] === q[2] ? p[2] : -1;
      segs.push({ x1: p[0], z1: p[1], x2: q[0], z2: q[1], len, cum: total, lane });
      total += len;
      if (lane === LANES - 1) laneEnd = total;
    }
    const pos = (d) => {
      d = clamp(d, 0, total - 0.001);
      for (const s of segs) if (d <= s.cum + s.len) {
        const t = (d - s.cum) / s.len;
        return { x: lerp(s.x1, s.x2, t), z: lerp(s.z1, s.z2, t), dx: (s.x2 - s.x1) / s.len, dz: (s.z2 - s.z1) / s.len, lane: s.lane };
      }
      return { x: X0, z: Z0, dx: 1, dz: 0, lane: 0 };
    };
    const pathD = (px, pz) => {
      let best = 1e9, bd = 0;
      for (const s of segs) {
        if (s.lane < 0) continue;
        const t = clamp(((px - s.x1) * (s.x2 - s.x1) + (pz - s.z1) * (s.z2 - s.z1)) / (s.len * s.len), 0, 1);
        const dd = Math.hypot(px - lerp(s.x1, s.x2, t), pz - lerp(s.z1, s.z2, t));
        if (dd < best) { best = dd; bd = s.cum + t * s.len; }
      }
      return bd;
    };
    const TINT = {
      energy: { lo: [0.13, 0.3, 0.72], hi: [0.42, 0.68, 1] },
      agri: { lo: [0.1, 0.34, 0.44], hi: [0.42, 0.82, 0.62] },
      rescue: { lo: [0.24, 0.24, 0.4], hi: [0.66, 0.56, 0.72] },
    };
    const ndvi = (x, z, list) => {
      let n = 0.6 + 0.3 * Math.sin(x * 0.06 + 1) * Math.cos(z * 0.08) + 0.1 * Math.sin(x * 0.2 + z * 0.13);
      list.forEach((q) => { n -= 0.75 * Math.exp(-((x - q.x) ** 2 + (z - q.z) ** 2) / 120); });
      return clamp(n, 0, 1);
    };
    const ndviColor = (n) => n < 0.45 ? [1, lerp(0.25, 0.78, n / 0.45), 0.2] : [lerp(1, 0.35, (n - 0.45) / 0.55), lerp(0.78, 0.92, (n - 0.45) / 0.55), lerp(0.2, 0.38, (n - 0.45) / 0.55)];

    let pillar = o.pillar, terrainArr, staticArr, cells = [], dets = [];
    let d = o.mode === 'mission' ? laneEnd : 0, hy = 0, playing = o.mode !== 'mission', speedMul = 1;
    let layers = { terrain: true, path: true, dets: true, overlay: true };
    let view = 'orbit', zoomK = 1, selected = null;
    let yaw = 0.7, pitchV = 0.62, drag = null, mx = 0, my = 0;
    let cT = [0, 2, 0], cR = 150, cP = 0.62, hudT = 0;

    function build() {
      const T = TINT[pillar];
      const tb = new Batch();
      const S = 176, STEP = 8, SUB = 4;
      const tc = (h) => { const k = smooth(-4, 30, h); return [lerp(T.lo[0], T.hi[0], k), lerp(T.lo[1], T.hi[1], k), lerp(T.lo[2], T.hi[2], k), 0.2 + 0.32 * k]; };
      for (let g = -S; g <= S; g += STEP) for (let u = -S; u < S; u += SUB) {
        const h1 = ground(u, g), h2 = ground(u + SUB, g);
        tb.line(u, h1, g, u + SUB, h2, g, tc(h1), tc(h2));
        const k1 = ground(g, u), k2 = ground(g, u + SUB);
        tb.line(g, k1, u, g, k2, u + SUB, tc(k1), tc(k2));
      }
      terrainArr = new Float32Array(tb.a);
      const sb = new Batch(), bc = a(COL.cyan, 0.7);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
        const x = sx * 64, z = sz * 44, y = ground(x, z) + 0.4;
        sb.line(x, y, z, x - sx * 10, y, z, bc);
        sb.line(x, y, z, x, y, z - sz * 10, bc);
      });
      if (pillar === 'rescue') {
        let seed = 11;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 30; i++) {
          const x = -60 + rnd() * 120, z = -40 + rnd() * 80, w = 3 + rnd() * 6, dd = 3 + rnd() * 5, h = 1 + rnd() * 5, r = rnd() * 1.2;
          const g = ground(x, z), c = Math.cos(r), s = Math.sin(r), col = a([0.62, 0.56, 0.78], 0.32);
          const Q = [[-w, -dd], [w, -dd], [w, dd], [-w, dd]].map(([lx, lz]) => [x + (lx * c - lz * s) * 0.5, z + (lx * s + lz * c) * 0.5]);
          for (let k = 0; k < 4; k++) {
            const p = Q[k], q = Q[(k + 1) % 4];
            sb.line(p[0], g, p[1], q[0], g, q[1], col);
            sb.line(p[0], g + h * (k % 2 ? 1 : 0.55), p[1], q[0], g + h * ((k + 1) % 2 ? 1 : 0.55), q[1], col);
            sb.line(p[0], g, p[1], p[0], g + h * (k % 2 ? 1 : 0.55), p[1], col);
          }
        }
      }
      staticArr = new Float32Array(sb.a);

      const src = D.P[pillar].dets;
      cells = [];
      if (pillar === 'energy') {
        for (let r = 0; r < 14; r++) for (let c = 0; c < 23; c++) {
          const x = -57.5 + c * 5.2, z = -38.5 + r * 5.5;
          const hot = src.some((q) => Math.abs(q.x - x) < 0.1 && Math.abs(q.z - z) < 0.1);
          cells.push({ x, z, trig: pathD(x, z), hot });
        }
      } else {
        for (let r = 0; r < 14; r++) for (let c = 0; c < 20; c++) {
          const x = -57 + c * 6, z = -39 + r * 6;
          cells.push({ x, z, trig: pathD(x, z), n: pillar === 'agri' ? ndvi(x, z, src) : 0.2 + 0.5 * Math.max(0, Math.sin(x * 0.09) * Math.cos(z * 0.12)) });
        }
      }
      dets = src.map((q, i) => ({ id: q.id, x: q.x, z: q.z, cls: q.cls, conf: q.conf, sev: q.sev, i, trig: pathD(q.x, q.z), sx: -1, sy: -1, vis: false }));
      if (o.labelsEl) {
        o.labelsEl.innerHTML = '';
        dets.forEach((q) => {
          const el = document.createElement('div');
          el.className = 'gl-tag';
          el.style.color = q.sev === 'crit' ? '#FF6A3D' : '#FFB547';
          el.innerHTML = q.cls.toUpperCase() + '<i>' + q.conf.toFixed(2) + '</i>';
          o.labelsEl.appendChild(el);
          q.el = el;
        });
      }
    }

    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.clientWidth / Math.max(1, r.width), sy = canvas.clientHeight / Math.max(1, r.height);
      return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy, r];
    };
    const onDown = (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch: pitchV, moved: false }; };
    const onMove = (e) => {
      const [px, py] = toLocal(e);
      mx = clamp((px / Math.max(1, canvas.clientWidth)) * 2 - 1, -1, 1);
      my = clamp((py / Math.max(1, canvas.clientHeight)) * 2 - 1, -1, 1);
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      yaw = drag.yaw - dx * 0.006;
      pitchV = clamp(drag.pitch + dy * 0.004, 0.22, 1.35);
    };
    const onUp = (e) => {
      if (drag && !drag.moved) {
        const [px, py] = toLocal(e);
        let best = null, bd = 30;
        dets.forEach((q) => { if (!q.vis) return; const dd = Math.hypot(q.sx - px, q.sy - py); if (dd < bd) { bd = dd; best = q; } });
        if (o.onPick) o.onPick(best ? best.id : null);
      }
      drag = null;
    };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    build();

    return {
      canvas,
      total, laneEnd,
      markers: () => dets.map((q) => ({ id: q.id, sev: q.sev, frac: q.trig / total })),
      // Live pose + world geometry so other views (e.g. the FPV feed on /live) stay in sync
      pose: () => { const P = pos(d); return { x: P.x, z: P.z, hy, d, total, laneEnd, alt: ALT, lane: P.lane, playing }; },
      world: () => ({ terrainArr, staticArr, cells, dets, ground, layers, selected, pillar }),
      setPillar(k) { if (k !== pillar) { pillar = k; selected = null; build(); } },
      setLayers(l) { layers = Object.assign({}, layers, l); },
      select(id) { selected = id; },
      setView(v) { view = v; },
      zoom(f) { zoomK = clamp(zoomK * f, 0.45, 1.8); },
      resetView() { zoomK = 1; yaw = 0.7; pitchV = 0.62; view = 'orbit'; selected = null; },
      setTime(f) { d = clamp(f, 0, 1) * total; },
      getTime() { return d / total; },
      setPlaying(p) { playing = p; if (p && (o.mode !== 'mission' || d >= laneEnd - 0.01)) { if (o.mode === 'mission') d = 0; } },
      isPlaying() { return playing; },
      setSpeed(s) { speedMul = s; },
      destroy() {
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      },
      frame(t, dt) {
        const asp = R.resize();
        if (playing) {
          d += dt * SPEED * speedMul;
          if (d >= total) { if (o.mode === 'mission') { d = total - 0.001; playing = false; } else d = 0; }
        }
        const P = pos(d);
        let dyaw = Math.atan2(P.dz, P.dx) - hy;
        while (dyaw > Math.PI) dyaw -= Math.PI * 2;
        while (dyaw < -Math.PI) dyaw += Math.PI * 2;
        hy += dyaw * Math.min(1, dt * 3.5);

        // camera
        let targ = [0, 2, 0], rad = o.mode === 'mission' ? 135 : 150;
        if (view === 'follow') { targ = [P.x, 12, P.z]; rad = 72; }
        const selDet = selected ? dets.find((q) => q.id === selected) : null;
        if (selDet) { targ = [selDet.x, 4, selDet.z]; rad = 62; }
        rad *= zoomK * Math.max(1, 1.25 / asp);
        const k = Math.min(1, dt * 2.6);
        cT = [lerp(cT[0], targ[0], k), lerp(cT[1], targ[1], k), lerp(cT[2], targ[2], k)];
        cR = lerp(cR, rad, k);
        cP = lerp(cP, view === 'top' ? 1.42 : pitchV, Math.min(1, dt * 3));
        const cy = yaw + (o.mode === 'overview' && !drag ? t * 0.03 + mx * 0.12 : 0);
        const eye = [cT[0] + cR * Math.cos(cP) * Math.sin(cy), cT[1] + cR * Math.sin(cP), cT[2] + cR * Math.cos(cP) * Math.cos(cy)];
        const M = K.camera(asp, eye, cT, 0.72);
        R.begin(M, eye, 150, 400);
        if (layers.terrain) R.draw(terrainArr, 'lines', 'add');
        R.draw(staticArr, 'lines', 'add');

        const fill = new Batch(), edge = new Batch();
        if (pillar === 'energy') {
          cells.forEach((c) => {
            const g = ground(c.x, c.z), done = d > c.trig, hot = c.hot && done && layers.overlay;
            const p1 = [c.x - 2.3, g + 0.5, c.z + 1.25], p2 = [c.x + 2.3, g + 0.5, c.z + 1.25], p3 = [c.x + 2.3, g + 2.1, c.z - 1.25], p4 = [c.x - 2.3, g + 2.1, c.z - 1.25];
            fill.quad(p1, p2, p3, p4, hot ? a(COL.crit, 0.6) : done ? [0.12, 0.32, 0.78, 0.34] : [0.2, 0.35, 0.7, 0.1]);
            const ec = hot ? a(COL.crit, 1) : done ? a(COL.cyan, 0.5) : a(COL.blue, 0.22);
            edge.line(...p1, ...p2, ec); edge.line(...p2, ...p3, ec); edge.line(...p3, ...p4, ec); edge.line(...p4, ...p1, ec);
          });
        } else {
          cells.forEach((c) => {
            const done = d > c.trig, g = ground(c.x, c.z) + 0.2, h = 2.7;
            const p1 = [c.x - h, g, c.z - h], p2 = [c.x + h, g, c.z - h], p3 = [c.x + h, g, c.z + h], p4 = [c.x - h, g, c.z + h];
            if (pillar === 'agri') {
              const col = ndviColor(c.n), on = done && layers.overlay;
              if (on) fill.quad(p1, p2, p3, p4, [col[0], col[1], col[2], 0.36]);
              const ec = on ? [col[0], col[1], col[2], 0.35] : [0.4, 0.8, 0.6, done ? 0.2 : 0.1];
              edge.line(...p1, ...p2, ec); edge.line(...p2, ...p3, ec);
            } else if (done && layers.overlay) {
              fill.quad(p1, p2, p3, p4, [lerp(0.25, 1, c.n), lerp(0.1, 0.55, c.n * c.n), lerp(0.45, 0.15, c.n), 0.1 + 0.12 * c.n]);
            }
          });
        }
        R.draw(fill, 'tris', 'alpha');
        R.draw(edge, 'lines', 'add');

        if (layers.path) {
          const path = new Batch();
          segs.forEach((s) => {
            for (let u = 0; u < s.len; u += 3) {
              const u2 = Math.min(s.len, u + 1.6), c = s.cum + u < d ? a(COL.warn, 0.8) : a(COL.white, 0.16);
              path.line(lerp(s.x1, s.x2, u / s.len), ALT, lerp(s.z1, s.z2, u / s.len), lerp(s.x1, s.x2, u2 / s.len), ALT, lerp(s.z1, s.z2, u2 / s.len), c);
            }
          });
          R.draw(path, 'lines', 'add');
        }

        // scan footprint + drone
        const fx = Math.cos(hy), fz = Math.sin(hy);
        const loc = (lx, lz) => [P.x + lx * fx - lz * fz, P.z + lx * fz + lz * fx];
        const corners = [[-7, -11], [7, -11], [7, 11], [-7, 11]].map(([lx, lz]) => { const q = loc(lx, lz); return [q[0], ground(q[0], q[1]) + 0.5, q[1]]; });
        const scan = new Batch(), scanFill = new Batch(), dr = new Batch(), glow = new Batch();
        scanFill.quad(corners[0], corners[1], corners[2], corners[3], a(COL.cyan, 0.08));
        for (let q = 0; q < 4; q++) {
          const p = corners[q], n = corners[(q + 1) % 4];
          scan.line(p[0], p[1], p[2], n[0], n[1], n[2], a(COL.cyan, 0.9));
          scan.line(P.x, ALT - 1.2, P.z, p[0], p[1], p[2], a(COL.cyan, 0.45), a(COL.cyan, 0.08));
        }
        const sw = -7 + 14 * ((t * 1.4) % 1), s1 = loc(sw, -11), s2 = loc(sw, 11);
        scan.line(s1[0], ground(s1[0], s1[1]) + 0.6, s1[1], s2[0], ground(s2[0], s2[1]) + 0.6, s2[1], a(COL.cyan, 0.75));
        R.draw(scanFill, 'tris', 'alpha');
        R.draw(scan, 'lines', 'add');
        const SC = 1.7, y = ALT, Dp = (lx, lz) => loc(lx * SC, lz * SC), c0 = Dp(0, 0);
        [[2.3, 2.3], [2.3, -2.3], [-2.3, -2.3], [-2.3, 2.3]].forEach(([lx, lz], i) => {
          const e = Dp(lx, lz);
          dr.line(c0[0], y, c0[1], e[0], y + 0.3, e[1], a(COL.white, 0.95));
          dr.ring(e[0], y + 0.6, e[1], 1.5 * SC, 14, a(COL.blue, 0.8));
          const b = t * 38 + i;
          dr.line(e[0] - Math.cos(b) * 1.4 * SC, y + 0.65, e[1] - Math.sin(b) * 1.4 * SC, e[0] + Math.cos(b) * 1.4 * SC, y + 0.65, e[1] + Math.sin(b) * 1.4 * SC, a(COL.cyan, 0.6));
        });
        const bx = [Dp(1.1, 0.8), Dp(1.1, -0.8), Dp(-1.1, -0.8), Dp(-1.1, 0.8)];
        for (let q = 0; q < 4; q++) dr.line(bx[q][0], y + 0.2, bx[q][1], bx[(q + 1) % 4][0], y + 0.2, bx[(q + 1) % 4][1], a(COL.white, 1));
        R.draw(dr, 'lines', 'add');
        glow.v(c0[0], y, c0[1], a(COL.blue, 0.4));
        R.draw(glow, 'points', 'add', 80);

        // detections
        const mk = new Batch(), mg = new Batch(), W = R.w, H = R.h;
        dets.forEach((q) => {
          const age = d - q.trig;
          q.vis = layers.dets && age > 0;
          if (!q.vis) { q.sx = -1; if (q.el) q.el.style.opacity = '0'; return; }
          const s = smooth(0, 12, age), col = q.sev === 'crit' ? COL.crit : COL.warn, isSel = q.id === selected;
          const gy = ground(q.x, q.z) + (pillar === 'energy' ? 2.2 : 0.4), top = gy + 5 + 11 * s;
          mk.line(q.x, gy, q.z, q.x, top, q.z, a(col, 0.9), a(col, 0.15));
          mk.ring(q.x, gy, q.z, 2.4, 20, a(col, 0.95));
          mk.ring(q.x, gy, q.z, 4.2, 24, a(col, 0.5), true);
          const ph = (t * 0.55 + q.i * 0.31) % 1;
          mk.ring(q.x, gy, q.z, 2.4 + ph * 10, 28, a(col, 0.7 * (1 - ph)));
          [[1.3, 0], [-1.3, 0], [0, 1.3], [0, -1.3]].forEach(([ox, oz]) => {
            mk.line(q.x + ox, top, q.z + oz, q.x, top + 1.8, q.z, a(col, 1));
            mk.line(q.x + ox, top, q.z + oz, q.x, top - 1.8, q.z, a(col, 1));
          });
          if (isSel) {
            const rot = t * 1.2;
            for (let k2 = 0; k2 < 4; k2++) {
              const a1 = rot + (k2 * Math.PI) / 2, a2 = a1 + 0.8;
              for (let j = 0; j < 6; j++) {
                const b1 = lerp(a1, a2, j / 6), b2 = lerp(a1, a2, (j + 1) / 6);
                mk.line(q.x + Math.cos(b1) * 7, gy, q.z + Math.sin(b1) * 7, q.x + Math.cos(b2) * 7, gy, q.z + Math.sin(b2) * 7, a(COL.cyan, 1));
              }
            }
            mk.line(q.x, gy, q.z, q.x, ALT + 6, q.z, a(COL.cyan, 0.35), a(COL.cyan, 0));
            mg.v(q.x, top, q.z, a(COL.cyan, 0.7));
          }
          mg.v(q.x, gy, q.z, a(col, 0.8 * s));
          if (pillar === 'rescue') mg.v(q.x, gy + 0.5, q.z, [1, 0.92, 0.8, 0.9 * (0.75 + 0.25 * Math.sin(t * 5 + q.i))]);
          const sp = K.project(M, q.x, top + 2.4, q.z, W, H);
          const hit = K.project(M, q.x, (gy + top) / 2, q.z, W, H);
          if (hit) { q.sx = hit[0]; q.sy = hit[1]; } else q.vis = false;
          if (q.el) {
            if (sp) {
              q.el.style.transform = 'translate(' + sp[0].toFixed(1) + 'px,' + sp[1].toFixed(1) + 'px) translate(-50%,-100%)';
              q.el.style.opacity = String(s);
              q.el.className = isSel ? 'gl-tag sel' : 'gl-tag';
            } else q.el.style.opacity = '0';
          }
        });
        R.draw(mk, 'lines', 'add');
        R.draw(mg, 'points', 'add', 60);

        hudT += dt;
        if (o.onHud && hudT > 0.15) {
          hudT = 0;
          o.onHud({
            lat: (22.3 - (P.z * 1.5) / 111320).toFixed(5) + '° N',
            lon: (70.8 + (P.x * 1.5) / 102990).toFixed(5) + '° E',
            hdg: String(Math.round((Math.atan2(Math.cos(hy), -Math.sin(hy)) * 180 / Math.PI + 360) % 360)).padStart(3, '0') + '°',
            lane: P.lane >= 0 ? (P.lane + 1) + ' / ' + LANES : 'Transit',
            cov: Math.min(100, (d / laneEnd) * 100),
            frac: d / total,
            playing,
            visible: dets.filter((q) => d > q.trig).length,
          });
        }
      },
    };
  }

  // Area-of-operations map: terrain around Rajkot, river, site pins coloured by pillar.
  _aoScene(K, canvas, labelsEl) {
    const R = K.renderer(canvas, [0.016, 0.043, 0.11]);
    if (!R) return null;
    const { Batch, COL, a, lerp, smooth, clamp } = K;
    const D = this._data();
    const self = this;
    const ground = (x, z) => 6 * Math.sin(x * 0.03 + 0.7) * Math.cos(z * 0.028) + 3 * Math.sin(x * 0.08 + z * 0.06) + 10 * smooth(70, 140, Math.hypot(x, z));
    const tb = new Batch();
    for (let g = -140; g <= 140; g += 7) for (let u = -140; u < 140; u += 3.5) {
      const col = (h) => [lerp(0.13, 0.42, smooth(-6, 16, h)), lerp(0.3, 0.68, smooth(-6, 16, h)), lerp(0.72, 1, smooth(-6, 16, h)), 0.14 + 0.22 * smooth(-6, 16, h)];
      const h1 = ground(u, g), h2 = ground(u + 3.5, g), k1 = ground(g, u), k2 = ground(g, u + 3.5);
      tb.line(u, h1, g, u + 3.5, h2, g, col(h1), col(h2));
      tb.line(g, k1, u, g, k2, u + 3.5, col(k1), col(k2));
    }
    // Aji river (stylised) and ring roads
    let prev = null;
    for (let z = -140; z <= 140; z += 4) {
      const x = 18 * Math.sin(z * 0.025) + 30 + z * 0.12, p = [x, ground(x, z) + 0.4, z];
      if (prev) tb.line(...prev, ...p, [0.36, 0.88, 1, 0.55]);
      prev = p;
    }
    tb.ring(0, 0.6, 0, 34, 64, [0.62, 0.7, 0.85, 0.28], true);
    tb.ring(0, 0.6, 0, 78, 96, [0.62, 0.7, 0.85, 0.18], true);
    const terrain = new Float32Array(tb.a);
    const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255, 1];
    const pins = D.sites.map((s) => {
      const el = labelsEl ? document.createElement('div') : null;
      if (el) { el.className = 'gl-tag'; el.style.color = D.P[s.pillar].color; el.textContent = s.short; labelsEl.appendChild(el); }
      return Object.assign({}, s, { col: hex(D.P[s.pillar].color), el, sx: -1, sy: -1 });
    });

    let drag = null, yaw = 0.5, pitch = 0.95;
    const local = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.clientWidth / Math.max(1, r.width), (e.clientY - r.top) * canvas.clientHeight / Math.max(1, r.height)]; };
    const onDown = (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; };
    const onMove = (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; yaw = drag.yaw - dx * 0.006; pitch = clamp(drag.pitch + dy * 0.004, 0.35, 1.4); };
    const onUp = (e) => {
      if (drag && !drag.moved) {
        const [px, py] = local(e);
        let best = null, bd = 34;
        pins.forEach((p) => { const dd = Math.hypot(p.sx - px, p.sy - py); if (dd < bd) { bd = dd; best = p; } });
        if (best) {
          const m = D.missionsAll.find((x) => x.siteKey === best.key);
          if (self._onAoPick) self._onAoPick(best.key, m); else if (m) self.setState({ sel: m.id });
        }
      }
      drag = null;
    };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    let cT = [0, 0, 0];

    return {
      destroy() { canvas.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); },
      frame(t, dt) {
        const asp = R.resize();
        const cur = pins.find((p) => p.key === self._selSite) || pins[0];
        const k = Math.min(1, dt * 2);
        cT = [lerp(cT[0], cur.x * 0.45, k), 0, lerp(cT[2], cur.z * 0.45, k)];
        const cy = yaw + (drag ? 0 : t * 0.04), rad = 190 * Math.max(1, 1.0 / asp);
        const eye = [cT[0] + rad * Math.cos(pitch) * Math.sin(cy), rad * Math.sin(pitch), cT[2] + rad * Math.cos(pitch) * Math.cos(cy)];
        const M = K.camera(asp, eye, cT, 0.66);
        R.begin(M, eye, 160, 420);
        R.draw(terrain, 'lines', 'add');
        const ln = new Batch(), pt = new Batch(), fl = new Batch();
        // Rajkot city marker
        ln.line(-5, 0.8, 0, 5, 0.8, 0, a(COL.white, 0.5)); ln.line(0, 0.8, -5, 0, 0.8, 5, a(COL.white, 0.5));
        pins.forEach((p) => {
          const g = ground(p.x, p.z) + 0.5, on = p.key === cur.key, h = on ? 24 : 14;
          ln.line(p.x, g, p.z, p.x, g + h, p.z, a(p.col, 0.9), a(p.col, 0.2));
          ln.ring(p.x, g, p.z, on ? 4 : 2.6, 24, a(p.col, on ? 1 : 0.7));
          [[1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]].forEach(([ox, oz]) => { ln.line(p.x + ox, g + h, p.z + oz, p.x, g + h + 2.2, p.z, a(p.col, 1)); ln.line(p.x + ox, g + h, p.z + oz, p.x, g + h - 2.2, p.z, a(p.col, 1)); });
          pt.v(p.x, g + h, p.z, a(p.col, on ? 1 : 0.6));
          if (on) {
            const ph = (t * 0.6) % 1;
            ln.ring(p.x, g, p.z, 4 + ph * 16, 36, a(p.col, 0.8 * (1 - ph)));
            // survey footprint: 7 short lanes
            for (let i = 0; i < 7; i++) {
              const z = p.z - 9 + i * 3;
              for (let u = -12; u < 12; u += 2) ln.line(p.x + u, g + 0.2, z, p.x + u + 1.1, g + 0.2, z, a(COL.warn, 0.7));
            }
            fl.quad([p.x - 13, g + 0.1, p.z - 10.5], [p.x + 13, g + 0.1, p.z - 10.5], [p.x + 13, g + 0.1, p.z + 10.5], [p.x - 13, g + 0.1, p.z + 10.5], a(p.col, 0.08));
          }
          const sp = K.project(M, p.x, g + h + 4, p.z, R.w, R.h), hit = K.project(M, p.x, g + h * 0.6, p.z, R.w, R.h);
          if (hit) { p.sx = hit[0]; p.sy = hit[1]; }
          if (p.el) {
            if (sp) { p.el.style.opacity = on ? '1' : '0.75'; p.el.className = on ? 'gl-tag sel' : 'gl-tag'; p.el.style.transform = 'translate(' + sp[0].toFixed(1) + 'px,' + sp[1].toFixed(1) + 'px) translate(-50%,-100%)'; }
            else p.el.style.opacity = '0';
          }
        });
        R.draw(fl, 'tris', 'alpha');
        R.draw(ln, 'lines', 'add');
        R.draw(pt, 'points', 'add', 40);
      },
    };
  }

  // Wireframe quadcopter into a Batch. opt: { explode 0..1, color, rotor, legs }
  _drawDrone(K, b, x, y, z, yaw, sc, t, opt) {
    const { a, COL } = K;
    opt = opt || {};
    const ex = opt.explode || 0, col = opt.color || COL.white, rc = opt.rotor || COL.blue;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const P = (lx, ly, lz) => [x + (lx * c - lz * s) * sc, y + ly * sc, z + (lx * s + lz * c) * sc];
    const L = (p, q, cc) => b.line(p[0], p[1], p[2], q[0], q[1], q[2], cc);
    const box = (cx, cy, cz, hx, hy, hz, cc) => {
      const v = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]].map(([i, j, k]) => P(cx + i * hx, cy + j * hy, cz + k * hz));
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => L(v[i], v[j], cc));
    };
    box(0, 0, 0, 1.5, 0.28, 1.0, a(col, 0.95));
    box(0, 0.5 + ex * 1.6, 0, 0.9, 0.18, 0.55, a(COL.green, 0.8));
    box(1.1 + ex * 0.8, -0.55 - ex * 1.4, 0, 0.35, 0.35, 0.35, a(COL.cyan, 0.9));
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([sx, sz], i) => {
      const o = ex * 1.3;
      const rx = sx * (2.6 + o), rz = sz * (2.6 + o), ry = 0.62 + ex * 1.2;
      L(P(sx * 1.0, 0, sz * 0.7), P(rx, 0.1, rz), a(col, 0.95));
      L(P(rx, 0.1, rz), P(rx, 0.5 + ex * 0.6, rz), a(col, 0.9));
      for (let k = 0; k < 18; k++) {
        const a1 = (k / 18) * Math.PI * 2, a2 = ((k + 1) / 18) * Math.PI * 2;
        L(P(rx + Math.cos(a1) * 1.55, ry, rz + Math.sin(a1) * 1.55), P(rx + Math.cos(a2) * 1.55, ry, rz + Math.sin(a2) * 1.55), a(rc, 0.85));
      }
      const bl = t * 30 + i * 0.8;
      L(P(rx - Math.cos(bl) * 1.45, ry + 0.03, rz - Math.sin(bl) * 1.45), P(rx + Math.cos(bl) * 1.45, ry + 0.03, rz + Math.sin(bl) * 1.45), a(COL.cyan, 0.65));
    });
    if (opt.legs !== false) {
      [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([sx, sz]) => L(P(sx * 0.9, -0.28, sz * 0.6), P(sx * 1.2, -1.1 - ex * 0.5, sz * 0.9), a(col, 0.6)));
    }
  }
