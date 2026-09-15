// Behaviour patches applied while converting design artboards into app views.
// Each entry is [from, to]; `html` patches run on the artboard markup, `js` on its logic class.
// A patch whose `from` text is missing fails the conversion, so design edits can't silently drop wiring.

export const EXTRA_LINKS = {
  'Explore the Rajkot demo mission Simulated No sign-in needed. Simulated telemetry and sample detections.': "'/demo'",
  'Retry': "'/missions'",
  'Open mission twin →': "'/missions/' + (v.sessionId || (v.pc ? v.pc.mission : 'AER-EN-0142'))",
};

export const EXTRA_BUTTONS = {
  'Enter command center': "(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('next')) || '/dashboard'",
};

const NEW_RUN = `  // Real run: POST each uploaded image to the FastAPI backend; fall back to a labelled simulation.
  async _run() {
    if (this.state.phase === 'running') return;
    const pillar = this.state.pillar;
    const files = this._files(pillar).filter((f) => f.file && this.state.removed.indexOf(f.name) < 0 && !/^video\\//.test(f.file.type || ''));
    if (!files.length) return this._simulate('Sample files · simulated run, no backend call');
    this.setState({ phase: 'running', prog: 0.05, runNote: '' });
    const online = await pingApi();
    if (!online) return this._simulate('Backend not reachable at ' + API_URL + ' · simulated run');
    const results = [];
    for (let i = 0; i < files.length; i++) {
      try { results.push(await inferFile(pillar, files[i].file)); }
      catch (e) { results.push({ filename: files[i].name, error: String((e && e.message) || e), detections: [] }); }
      this._runFrac = (i + 1) / files.length;
      if (this._alive) this.setState({ prog: Math.min(0.95, 0.3 + 0.65 * ((i + 1) / files.length)) });
    }
    const ok = results.filter((r) => !r.error);
    const dets = [];
    ok.forEach((r) => (r.detections || []).forEach((d) => dets.push(Object.assign({}, d, { filename: r.filename, telemetry: r.telemetry, image: r.image }))));
    const code = { energy: 'EN', agri: 'AG', rescue: 'RS' }[pillar];
    const id = 'AER-' + code + '-U' + Date.now().toString(36).slice(-5).toUpperCase();
    const times = ok.map((r) => r.inference_time_ms || 0);
    saveSession({
      session: { id, created_utc: new Date().toISOString(), site: 'Uploaded mission', mode: 'live_upload', api: API_URL },
      pillar,
      model: { weights: this._data().P[pillar].model, conf_threshold: 0.5, source: 'backend' },
      telemetry: { source: 'backend telemetry.py (manifest or procedural fallback)', frames: ok.length },
      detections: dets,
      results,
      metrics: { inference_time_ms: times.length ? +(times.reduce((s, t) => s + t, 0) / times.length).toFixed(1) : null, detections_total: dets.length, failed_frames: results.length - ok.length },
    });
    if (this._alive) this.setState({ phase: 'done', prog: 1, sessionId: id, runNote: dets.length + ' detections · ' + ok.length + ' of ' + results.length + ' frames processed by the backend' + (results.length - ok.length ? ' · ' + (results.length - ok.length) + ' failed' : '') });
  }

  _addFiles(list) {
    const MAN = /^(solar|agri|thermal)_\\d+\\.jpe?g$/i;
    const add = Array.from(list || []).map((f) => ({
      name: f.name, type: (f.type || '').startsWith('video') ? 'Video · not sent' : 'Image',
      size: (f.size / 1048576).toFixed(1) + ' MB', res: '—', gps: MAN.test(f.name) ? 'manifest' : 'none', frames: 1, file: f,
    }));
    if (add.length) this.setState({ uploads: (this.state.uploads || []).concat(add), removed: [], phase: 'ready', prog: 0, sessionId: null, runNote: '' });
  }

  _simulate(note) {
    this.setState({ phase: 'running', prog: 0, runNote: note });`;

const SESSION_CTOR = (rest) => `this._dataOverride = sessionData(props.id, this.__data());\n    this.state = { pillar: props.pillar || 'energy', ${rest}`;

export const PATCHES = {
  Landing: {
    html: [
      [/<nav class="nav-links">[\s\S]*?<\/nav>/, '<nav class="nav-links">\n        <a href="#">Platform</a>\n        <a href="#">Energy</a>\n        <a href="#">Agri</a>\n        <a href="#">Rescue</a>\n        <a href="#">Sign in</a>\n      </nav>'],
      [/href="#contact"/g, 'href="#"'],
    ],
  },
  Login: {
    js: [
      ["this._timers.push(setTimeout(() => { this._phase = 'granted'; this.setState({ phase: 'granted' }); }, 800));", "this._timers.push(setTimeout(() => { signIn(); this._phase = 'granted'; this.setState({ phase: 'granted' }); }, 800));"],
      ["reset: () => { this._clear();", 'reset: () => { signOut(); this._clear();'],
    ],
  },
  Dashboard: {},
  MissionTwin: {
    js: [
      ["this.state = { pillar: 'energy', sel: 'DET-EN-01', ", "this._dataOverride = sessionData(props.id, this.__data());\n    const P0 = props.pillar || 'energy', D0 = this._data().P[P0];\n    this.state = { pillar: P0, sel: props.detectionId || (D0.dets[0] ? D0.dets[0].id : null), "],
      ['const first = D.P[k].dets[0].id;', 'const first = D.P[k].dets[0] ? D.P[k].dets[0].id : null;'],
      ["this.setState({ pillar: k, sel: first, filter: 'all' });", "this.setState({ pillar: k, sel: first, filter: 'all' });\n      window.history.replaceState(null, '', '/missions/' + D.P[k].mission);"],
    ],
  },
  MissionReport: {
    // Uploaded missions state their real telemetry source, model and timing instead of the demo wording.
    html: [
      ['Telemetry for this mission is <b>simulated</b> from the golden-demo flight manifest. Coordinates are approximate and not survey-grade. Detections come from demo weights ({{ pc.model }}) and are not validated field measurements.',
        'Telemetry for this mission is <b>{{ provTele }}</b>. Coordinates are approximate and not survey-grade. Detections come from {{ provDet }} and are not validated field measurements.'],
      ['<div><span>Telemetry source</span><b>Simulated (manifest)</b></div>', '<div><span>Telemetry source</span><b>{{ provTeleShort }}</b></div>'],
      ['<div><span>Inference time</span><b>38.4 ms / frame · sample</b></div>', '<div><span>Inference time</span><b>{{ infTime }}</b></div>'],
    ],
    js: [
      ['const payload = {', 'const payload = D.session ? { session: D.session.session, pillar: D.session.pillar, model: D.session.model, telemetry: D.session.telemetry, detections: D.session.detections, results: D.session.results, metrics: Object.assign({}, D.session.metrics, { sample_data: false }) } : {'],
      ["      isPdf: fmt === 'pdf', isJson: fmt === 'json',", "      provTele: D.session ? ((D.session.detections || []).some((d) => d.telemetry && d.telemetry.source === 'simulated') ? 'reported by the backend; some frames had no manifest entry, so their positions are simulated' : 'reported by the backend from the golden-demo flight manifest') : 'simulated from the golden-demo flight manifest',\n      provDet: D.session ? 'the fine-tuned model ' + pc.model + ' via the inference API' : 'demo weights (' + pc.model + ')',\n      provTeleShort: D.session ? ((D.session.detections || []).some((d) => d.telemetry && d.telemetry.source === 'simulated') ? 'Backend · partly simulated' : 'Backend · manifest') : 'Simulated (manifest)',\n      infTime: D.session && D.session.metrics && D.session.metrics.inference_time_ms ? D.session.metrics.inference_time_ms + ' ms / frame' : '38.4 ms / frame · sample',\n      isPdf: fmt === 'pdf', isJson: fmt === 'json',"],
      ["this.state = { pillar: 'energy', fmt: 'pdf', ", SESSION_CTOR("fmt: 'pdf', ")],
      ['const jsonLines = this._jsonLines(payload);', 'const jsonLines = this._jsonLines(payload);\n    this._payload = payload;'],
      ["this._expT = setTimeout(() => { if (this._alive) this.setState({ exp: 'done' }); }, 1400);", "this._expT = setTimeout(() => {\n      if (!this._alive) return;\n      this.setState({ exp: 'done' });\n      if (fmt === 'json') downloadFile(this.renderVals().fileName, JSON.stringify(this._payload, null, 2));\n      else window.print();\n    }, 700);"],
      ["goNote: exp === 'done' ? 'Prototype: file download is simulated' :", "goNote: exp === 'done' ? (fmt === 'pdf' ? 'Choose “Save as PDF” in the print dialog' : 'JSON saved to your downloads') :"],
      ['const pickPillar = (k) => this.setState({ pillar: k, exp: \'idle\' });', "const pickPillar = (k) => { this.setState({ pillar: k, exp: 'idle' }); window.history.replaceState(null, '', '/missions/' + D.P[k].mission + '/report'); };"],
    ],
  },
  Frames: {
    js: [["this.state = { pillar: 'energy', filter: 'all', ", SESSION_CTOR("filter: 'all', ")]],
  },
  NewInspection: {
    html: [
      ['<button class="btn btn-ghost btn-sm">Browse files</button>', '<button class="btn btn-ghost btn-sm" onClick="{{ browse }}">Browse files</button><input type="file" multiple="" accept="image/*,video/*" class="hidden-file" data-file="upload" onChange="{{ onFiles }}">'],
      ['<div class="drop">', '<div class="drop" onDragOver="{{ dragOver }}" onDrop="{{ onDrop }}">'],
      ['<div class="drop-t">Drop drone imagery or video</div>', '<div class="drop-t">{{ dropTitle }}</div>'],
    ],
    js: [
      ['  _files(pillar) {\n', '  _files(pillar) {\n    if (this.state && this.state.uploads && this.state.uploads.length) return this.state.uploads;\n'],
      ["  _run() {\n    if (this.state.phase === 'running') return;\n    this.setState({ phase: 'running', prog: 0 });", NEW_RUN],
      ["doneNote: dets + ' detections · ' + frames + ' frames · sample result, not a field measurement',",
        "sessionId: this.state.sessionId,\n      dropTitle: this.state.uploads && this.state.uploads.length ? this.state.uploads.length + ' file(s) ready · drop more to add' : 'Drop drone imagery or video',\n      browse: () => { const el = document.querySelector('[data-file=\"upload\"]'); if (el) el.click(); },\n      onFiles: (e) => { this._addFiles(e.target.files); e.target.value = ''; },\n      dragOver: (e) => e.preventDefault(),\n      onDrop: (e) => { e.preventDefault(); this._addFiles(e.dataTransfer.files); },\n      doneNote: this.state.runNote || (dets + ' detections · ' + frames + ' frames · sample result, not a field measurement'),"],
      ["reset: () => { this._runFrac = 0; this.setState({ phase: 'ready', prog: 0 }); },", "reset: () => { this._runFrac = 0; this.setState({ phase: 'ready', prog: 0, sessionId: null, runNote: '', uploads: [] }); },"],
      ["runChip: phase === 'ready' ? 'Ready' :", "runNoteLive: this.state.runNote,\n      runChip: phase === 'ready' ? (this.state.uploads && this.state.uploads.length ? 'Ready · real files' : 'Ready · sample') :"],
    ],
  },
  MissionsLog: {},
  Solutions: {
    js: [
      ["this.state = { pillar: 'energy' };", "this.state = { pillar: props.pillar || 'energy' };"],
      ['pick: () => { this.setState({ pillar: k }); if (this._twin) this._twin.setPillar(k); },', "pick: () => { this.setState({ pillar: k }); if (this._twin) this._twin.setPillar(k); window.history.replaceState(null, '', '/solutions/' + k); },"],
    ],
  },
  SiteDetail: {
    js: [
      ["this.state = { pillar: 'energy', view: 'orbit', selMission: null };", "this.state = { pillar: props.pillar || 'energy', view: 'orbit', selMission: null };"],
      ["const siteKey = { energy: 'rsp', agri: 'kfb', rescue: 'ads' }[pillar];", "const siteKey = (this.props.id && D.sites.some((s) => s.key === this.props.id && s.pillar === pillar)) ? this.props.id : { energy: 'rsp', agri: 'kfb', rescue: 'ads' }[pillar];"],
    ],
  },
  Aircraft: {
    js: [["this.state = { pillar: 'energy', sel: 'QUAD-02', view: 'exploded' };\n    this._sel = 'QUAD-02';", "this.state = { pillar: 'energy', sel: props.id || 'QUAD-02', view: 'exploded' };\n    this._sel = props.id || 'QUAD-02';"]],
  },
  MissionPlanner: {
    html: [['<button class="btn btn-primary" onClick="{{ closeExport }}">Download · simulated</button>', '<button class="btn btn-primary" onClick="{{ downloadManifest }}">Download JSON</button>']],
    js: [
      ['      manifest,\n    };', '      manifest,\n      downloadManifest: () => this._downloadManifest(),\n    };'],
      ['  componentDidMount() {', `  // Full manifest: one entry per planned photo, same shape as backend/telemetry.py GOLDEN_DEMO_MANIFEST.
  _downloadManifest() {
    const pl = this._plan(), st = this.state, out = {};
    let idx = 0;
    pl.lanes.forEach(([p, q]) => {
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]) * 4, n = Math.floor(len / pl.interval) + 1;
      const hdg = ((Math.atan2(q[0] - p[0], -(q[1] - p[1])) * 180) / Math.PI + 360) % 360;
      for (let j = 0; j < n; j++) {
        const t = n > 1 ? j / (n - 1) : 0, x = p[0] + (q[0] - p[0]) * t, z = p[1] + (q[1] - p[1]) * t;
        idx++;
        out['frame_' + String(idx).padStart(4, '0') + '.jpg'] = { lat: +(22.3 - (z * 4) / 111320).toFixed(6), lng: +(70.8 + (x * 4) / 102990).toFixed(6), alt: st.alt, heading: +hdg.toFixed(1) };
      }
    });
    downloadFile('manifest_' + st.pillar + '_' + idx + '_frames.json', JSON.stringify(out, null, 2));
    this.setState({ showExport: false });
  }

  componentDidMount() {`],
    ],
  },
  Reports: {
    html: [
      ['<button class="btn btn-ghost">Download · simulated</button>', '<button class="btn btn-ghost" onClick="{{ downloadCur }}">Download JSON</button>'],
      ['<button class="btn btn-ghost">Copy share link</button>', '<button class="btn btn-ghost" onClick="{{ copyLink }}">{{ copyLabel }}</button>'],
    ],
    js: [['      details: [', "      downloadCur: () => downloadFile(cur.id + '.json', JSON.stringify(cur, null, 2)),\n      copyLabel: this.state.copied ? 'Link copied' : 'Copy share link',\n      copyLink: () => { try { navigator.clipboard.writeText(window.location.origin + '/missions/' + cur.mission + '/report'); } catch (e) {} this.setState({ copied: true }); setTimeout(() => this._alive !== false && this.setState({ copied: false }), 1600); },\n      details: ["]],
  },
  Status: {
    js: [
      ["{ key: 'infer', name: 'Inference API · FastAPI', desc: 'POST /api/v1/infer/{pillar} · YOLO', st: 'demo',", "{ key: 'infer', name: 'Inference API · FastAPI', desc: 'POST /api/v1/infer/{pillar} · ' + API_URL, st: this.state && this.state.api === true ? 'op' : this.state && this.state.api === false ? 'down' : 'demo',"],
      ["planned: ['Planned', '#62738F'] };", "planned: ['Planned', '#62738F'], down: ['Unreachable', '#FF6A3D'] };"],
      ['componentDidMount() { this._alive = true; this._startClock(); this._boot(0); }', 'componentDidMount() { this._alive = true; this._startClock(); this._boot(0); pingApi().then((ok) => { if (this._alive) this.setState({ api: ok }); }); }'],
    ],
  },
  SignalLost: {
    html: [['<a class="btn btn-primary" href="#">{{ v.primary }}</a>\n      <a class="btn btn-ghost" href="#">{{ v.secondary }}</a>', '<button class="btn btn-primary" onClick="{{ primaryAct }}">{{ v.primary }}</button>\n      <button class="btn btn-ghost" onClick="{{ secondaryAct }}">{{ v.secondary }}</button>']],
    js: [
      ["this.state = { kind: '404' };\n    this._kind = '404';", "this.state = { kind: props.variant === '500' ? '500' : '404' };\n    this._kind = this.state.kind;"],
      ["['Reference', 'ERR-[REQUEST ID]']", "['Reference', 'ERR-' + (this.props.errorRef || '[REQUEST ID]')]"],
      ["['Requested', '[REQUESTED PATH]']", "['Requested', typeof window !== 'undefined' ? window.location.pathname : '—']"],
      ['      v: V,', "      v: V,\n      primaryAct: () => { if (kind === '500') { if (this.props.reset) this.props.reset(); else window.location.reload(); } else this.go('/dashboard'); },\n      secondaryAct: () => this.go(kind === '500' ? '/status' : '/missions'),"],
    ],
  },
  SettingsProfile: {
    js: [
      ['    this._motion = false;\n  }', "    this._motion = false;\n    const saved = readJSON('aero.profile', null);\n    if (saved) Object.assign(this.state, saved, { dirty: false, saved: false });\n  }"],
      ['save: () => this.setState({ dirty: false, saved: true }),', "save: () => { this.setState({ dirty: false, saved: true }); writeJSON('aero.profile', { prefs: this.state.prefs, notifs: this.state.notifs, mfa: this.state.mfa, motion: this.state.motion }); setPillar(this.state.prefs.pillar); },"],
    ],
  },
  SettingsOrganization: {
    js: [
      ['this._onAoPick = (key) => { this._selSite = key; this.setState({ sel: key }); };\n  }', "this._onAoPick = (key) => { this._selSite = key; this.setState({ sel: key }); };\n    const saved = readJSON('aero.org', null);\n    if (saved) Object.assign(this.state, saved);\n  }"],
      ['save: () => this.setState({ dirty: false, saved: true }),', "save: () => { this.setState({ dirty: false, saved: true }); writeJSON('aero.org', { enabled: this.state.enabled, ret: this.state.ret }); },"],
    ],
  },
  Access: {
    js: [
      ["this.state = { page: 'request', ", "this.state = { page: props.variant === 'forgot' ? 'forgot' : 'request', "],
      ["pick: () => this.setState({ page: k, done: false, err: '' }) })),", "pick: () => { this.setState({ page: k, done: false, err: '' }); window.history.replaceState(null, '', k === 'request' ? '/request-access' : '/forgot-password'); } })),"],
      ['submitReq: () => { if (need()) this.setState({ done: true }); },', "submitReq: () => { if (need()) { this.setState({ done: true }); submitRequest({ type: 'access', email: s.email, role: s.role, pillars: s.pillars }); } },"],
      ['submitForgot: () => { if (need()) { this.setState({ done: true }); this._cooldown(); } },', "submitForgot: () => { if (need()) { this.setState({ done: true }); this._cooldown(); submitRequest({ type: 'password-reset', email: s.email }); } },"],
    ],
  },
  Company: {
    js: [
      ["this.state = { page: 'about', ", "this.state = { page: props.variant === 'contact' ? 'contact' : 'about', "],
      ["pick: () => this.setState({ page: k }) })),", "pick: () => { this.setState({ page: k }); window.history.replaceState(null, '', '/' + k); } })),"],
      ["        this.setState({ sent: true, error: '' });\n", "        this.setState({ sent: true, error: '' });\n        submitRequest({ type: 'contact', email: this.state.email, name: this.state.name, interest: this.state.interest, size: this.state.size });\n"],
    ],
  },
};
