// Builds Login.dc.html from Login.template.html by copying the shared WebGL
// engine (_engine method) out of Main.dc.html, so both artboards stay in sync.
import { readFileSync, writeFileSync } from 'node:fs';

const main = readFileSync(new URL('./Main.dc.html', import.meta.url), 'utf8');
const start = main.indexOf('  // ------------------------------------------------------------------\n  // Minimal WebGL engine');
const end = main.indexOf('  // ------------------------------------------------------------------\n  // HERO');
if (start < 0 || end < 0) throw new Error('engine markers not found in Main.dc.html');

const hook = '    return { hero: (c, p) => self._heroScene(K, c, p), mini: (c, k) => self._miniScene(K, c, k) };';
let engine = main.slice(start, end);
if (!engine.includes(hook)) throw new Error('engine return hook not found');
engine = engine.replace(hook, '    return K;');

const tpl = readFileSync(new URL('./Login.template.html', import.meta.url), 'utf8');
if (!tpl.includes('/*ENGINE*/')) throw new Error('template placeholder missing');
writeFileSync(new URL('./Login.dc.html', import.meta.url), tpl.replace('  /*ENGINE*/', engine.trimEnd()));
console.log('Login.dc.html built');
