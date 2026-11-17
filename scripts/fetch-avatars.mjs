// Downloads every streamer avatar into public/streamers/ and points data/streamers.ts at the local copy.
// Run again after adding a streamer with a remote avatar URL:  node scripts/fetch-avatars.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const DATA = 'data/streamers.ts';
const OUT = 'public/streamers';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'streamer';

await mkdir(OUT, { recursive: true });
let src = await readFile(DATA, 'utf8');
const re = /name:\s*'([^']+)',\s*avatar:\s*'(https?:\/\/[^']+)'/g;
let ok = 0, fail = 0;
for (const [, name, url] of [...src.matchAll(re)]) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
    const type = (r.headers.get('content-type') || '').split(';')[0];
    if (!r.ok || !EXT[type]) throw new Error(`${r.status} ${type}`);
    const file = `${slug(name)}.${EXT[type]}`;
    await writeFile(`${OUT}/${file}`, Buffer.from(await r.arrayBuffer()));
    src = src.replace(url, `/streamers/${file}`);
    ok++; console.log('ok  ', name, '->', file);
  } catch (e) {
    fail++; console.log('FAIL', name, String(e.message || e));
  }
}
await writeFile(DATA, src);
console.log(`\n${ok} saved, ${fail} failed (failed ones keep their remote URL).`);
