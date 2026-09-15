// Aerolytics 3D engine on Three.js.
// Scenes build line / triangle / point batches with per-vertex colour and draw them with a
// shared shader (distance fog, soft round points, additive or alpha blending). The camera
// matrix is computed by the scene, so scenes stay small and deterministic.
import * as THREE from 'three';

function perspective(fov, asp, n, f) {
  const t = 1 / Math.tan(fov / 2);
  return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
}

function lookAt(e, c) {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
  let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
  let xx = zz, xy = 0, xz = -zx;
  l = Math.hypot(xx, xy, xz) || 1; xx /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
    -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
}

function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}

function project(m, x, y, z, w, h) {
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw <= 0.1) return null;
  return [(cx / cw * 0.5 + 0.5) * w, (1 - (cy / cw * 0.5 + 0.5)) * h];
}

function Batch() { this.a = []; }
Batch.prototype.v = function (x, y, z, c) { this.a.push(x, y, z, c[0], c[1], c[2], c[3]); };
Batch.prototype.line = function (x1, y1, z1, x2, y2, z2, c, c2) { this.v(x1, y1, z1, c); this.v(x2, y2, z2, c2 || c); };
Batch.prototype.tri = function (p, q, r, c) { this.v(p[0], p[1], p[2], c); this.v(q[0], q[1], q[2], c); this.v(r[0], r[1], r[2], c); };
Batch.prototype.quad = function (p, q, r, s, c) { this.tri(p, q, r, c); this.tri(p, r, s, c); };
Batch.prototype.ring = function (x, y, z, rad, seg, c, dash) {
  for (let i = 0; i < seg; i++) {
    if (dash && i % 2) continue;
    const a1 = (i / seg) * Math.PI * 2, a2 = ((i + 1) / seg) * Math.PI * 2;
    this.line(x + Math.cos(a1) * rad, y, z + Math.sin(a1) * rad, x + Math.cos(a2) * rad, y, z + Math.sin(a2) * rad, c);
  }
};

const VERT = `
precision highp float;
attribute vec3 position;
attribute vec4 color4;
uniform mat4 m;
uniform vec3 eye;
uniform vec2 fog;
uniform float ps;
varying vec4 vC;
void main() {
  gl_Position = m * vec4(position, 1.0);
  float d = distance(position, eye);
  vC = vec4(color4.rgb, color4.a * (1.0 - smoothstep(fog.x, fog.y, d)));
  gl_PointSize = ps * 120.0 / max(d, 1.0);
}`;
const FRAG = `
precision mediump float;
varying vec4 vC;
uniform float pt;
void main() {
  float a = 1.0;
  if (pt > 0.5) { a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); }
  gl_FragColor = vec4(vC.rgb, vC.a * a);
}`;

// Three.js-backed renderer with the batch API the scenes use.
function renderer(canvas, bg) {
  let three;
  try {
    three = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  three.autoClear = false;
  three.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
  const camera = new THREE.Camera();
  const uniforms = {
    m: { value: new THREE.Matrix4() },
    eye: { value: new THREE.Vector3() },
    fog: { value: new THREE.Vector2(100, 300) },
    ps: { value: 1 },
    pt: { value: 0 },
  };
  const makeMat = (additive) => new THREE.RawShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor,
    blendDst: additive ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor,
  });
  const mats = { add: makeMat(true), alpha: makeMat(false) };
  const pools = { lines: [], tris: [], points: [] };
  const counters = { lines: 0, tris: 0, points: 0 };
  const staticCache = new WeakMap();

  const makeObject = (mode) => {
    const geo = new THREE.BufferGeometry();
    const obj = mode === 'lines' ? new THREE.LineSegments(geo, mats.add) : mode === 'points' ? new THREE.Points(geo, mats.add) : new THREE.Mesh(geo, mats.add);
    obj.frustumCulled = false;
    obj.userData.capacity = 0;
    return obj;
  };
  const bind = (obj, arr, dynamic) => {
    const count = arr.length / 7;
    if (obj.userData.capacity < arr.length || !dynamic) {
      const buf = new THREE.InterleavedBuffer(dynamic ? new Float32Array(Math.max(arr.length, 7 * 256) * 1.5 | 0) : arr, 7);
      buf.setUsage(dynamic ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage);
      obj.geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buf, 3, 0));
      obj.geometry.setAttribute('color4', new THREE.InterleavedBufferAttribute(buf, 4, 3));
      obj.userData.capacity = buf.array.length;
      obj.userData.buf = buf;
    }
    if (dynamic) {
      obj.userData.buf.array.set(arr);
      obj.userData.buf.addUpdateRange(0, arr.length);
      obj.userData.buf.needsUpdate = true;
    }
    obj.geometry.setDrawRange(0, count);
  };

  const R = {
    gl: three.getContext(),
    three,
    w: 1,
    h: 1,
    resize() {
      // 1.25x keeps lines crisp while rendering ~50% fewer pixels than 1.75x on HiDPI screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
      if (three.getPixelRatio() !== dpr) three.setPixelRatio(dpr);
      const size = three.getSize(new THREE.Vector2());
      if (size.x !== w || size.y !== h) three.setSize(w, h, false);
      R.w = w; R.h = h;
      return w / h;
    },
    begin(m, eye, fogN, fogF) {
      counters.lines = 0; counters.tris = 0; counters.points = 0;
      three.clear(true, true, true);
      uniforms.m.value.fromArray(m);
      uniforms.eye.value.set(eye[0], eye[1], eye[2]);
      uniforms.fog.value.set(fogN, fogF);
    },
    draw(batch, mode, blend, size) {
      const isStatic = batch instanceof Float32Array;
      // dynamic batches copy straight from the JS array into a reused GPU buffer (no per-draw allocation)
      const arr = isStatic ? batch : batch.a;
      if (!arr.length) return;
      let obj;
      if (isStatic) {
        const key = mode + ':' + (blend || 'add');
        let per = staticCache.get(batch);
        if (!per) { per = {}; staticCache.set(batch, per); }
        obj = per[key];
        if (!obj) { obj = makeObject(mode); bind(obj, arr, false); per[key] = obj; }
      } else {
        const pool = pools[mode];
        obj = pool[counters[mode]];
        if (!obj) { obj = makeObject(mode); pool.push(obj); }
        counters[mode]++;
        bind(obj, arr, true);
      }
      obj.material = blend === 'alpha' ? mats.alpha : mats.add;
      uniforms.pt.value = mode === 'points' ? 1 : 0;
      uniforms.ps.value = size || 1;
      three.render(obj, camera);
    },
    dispose() {
      Object.values(pools).forEach((p) => p.forEach((o) => o.geometry.dispose()));
      mats.add.dispose();
      mats.alpha.dispose();
      three.dispose();
    },
  };
  return R;
}

function camera(asp, eye, target, fov) {
  return mul(perspective(fov, asp, 1, 900), lookAt(eye, target));
}

const COL = {
  cyan: [0.36, 0.88, 1, 1], blue: [0.3, 0.55, 1, 1], white: [0.9, 0.95, 1, 1],
  crit: [1, 0.38, 0.22, 1], warn: [1, 0.71, 0.28, 1], green: [0.48, 0.89, 0.63, 1],
};
const a = (c, al) => [c[0], c[1], c[2], al];
const lerp = (x, y, t) => x + (y - x) * t;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

export function makeEngine() {
  return { perspective, lookAt, mul, project, Batch, renderer, camera, COL, a, lerp, clamp, smooth };
}
