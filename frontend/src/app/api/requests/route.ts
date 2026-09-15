// Stores contact / pilot / access / password-reset requests in .data/requests.json (demo persistence).
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), '.data', 'requests.json');
const TYPES = ['contact', 'access', 'password-reset'];

async function load(): Promise<unknown[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

export async function GET() {
  return NextResponse.json(await load());
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const type = String(body.type || '');
  const email = String(body.email || '');
  if (!TYPES.includes(type)) return NextResponse.json({ error: 'unknown request type' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  const all = await load();
  const entry = { id: 'REQ-' + Date.now().toString(36).toUpperCase(), receivedAt: new Date().toISOString(), ...body };
  all.push(entry);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  return NextResponse.json({ ok: true, id: entry.id });
}
