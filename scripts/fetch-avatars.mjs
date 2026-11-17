// Downloads every active streamer avatar into public/streamers/ and points data/streamers.ts at the local copy.
// Run again after adding a streamer with a remote avatar URL:  node scripts/fetch-avatars.mjs
// Commented-out (//) entries are skipped.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const DATA = 'data/streamers.ts';
const OUT = 'public/streamers';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const ENTRY = /name:\s*'([^']+)',\s*avatar:\s*'(https?:\/\/[^']+)'/;

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'streamer';

await mkdir(OUT, { recursive: true });
const lines = (await readFile(DATA, 'utf8')).split('\n');
let ok = 0, fail = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('//')) continue;
  const m = lines[i].match(ENTRY);
  if (!m) continue;
  const [, name, url] = m;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
    const type = (r.headers.get('content-type') || '').split(';')[0];
    if (!r.ok || !EXT[type]) throw new Error(`${r.status} ${type}`);
    const file = `${slug(name)}.${EXT[type]}`;
    await writeFile(`${OUT}/${file}`, Buffer.from(await r.arrayBuffer()));
    lines[i] = lines[i].replace(url, `/streamers/${file}`);
    ok++;
    console.log('ok  ', name, '->', file);
  } catch (e) {
    fail++;
    console.log('FAIL', name, String(e.message || e));
  }
}

await writeFile(DATA, lines.join('\n'));
console.log(`\n${ok} saved, ${fail} failed (failed ones keep their remote URL).`);
