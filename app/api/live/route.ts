import { NextResponse } from 'next/server';
import { STREAMERS } from '@/data/streamers';

export const revalidate = 120; // re-check every 2 minutes

/**
 * Returns the names of streamers who are live right now.
 * - Kick: public channel API (no key needed; may be blocked by Kick's bot protection on some hosts)
 * - Twitch: needs TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET env vars (free at dev.twitch.tv)
 * - TikTok: no public API, never marked live
 */

const handle = (link: string, host: string) => {
  try {
    const u = new URL(link);
    if (!u.hostname.endsWith(host)) return null;
    return u.pathname.split('/').filter(Boolean)[0]?.toLowerCase() || null;
  } catch {
    return null;
  }
};

async function kickLive(slug: string) {
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return false;
    const j = await r.json();
    return Boolean(j?.livestream);
  } catch {
    return false;
  }
}

async function twitchLive(logins: string[]) {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret || !logins.length) return new Set<string>();
  try {
    const tok = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
      { method: 'POST', next: { revalidate: 3600 } }
    ).then((r) => r.json());
    const qs = logins.map((l) => `user_login=${encodeURIComponent(l)}`).join('&');
    const r = await fetch(`https://api.twitch.tv/helix/streams?${qs}`, {
      headers: { 'Client-Id': id, Authorization: `Bearer ${tok.access_token}` },
      next: { revalidate: 120 },
    });
    const j = await r.json();
    return new Set<string>((j?.data ?? []).map((s: any) => String(s.user_login).toLowerCase()));
  } catch {
    return new Set<string>();
  }
}

export async function GET() {
  const kick = STREAMERS.map((s) => ({ name: s.name, slug: handle(s.link, 'kick.com') })).filter((x) => x.slug);
  const twitch = STREAMERS.map((s) => ({ name: s.name, login: handle(s.link, 'twitch.tv') })).filter((x) => x.login);

  const [kickResults, twitchSet] = await Promise.all([
    Promise.all(kick.map(async (k) => ((await kickLive(k.slug!)) ? k.name : null))),
    twitchLive(twitch.map((t) => t.login!)),
  ]);

  const live = [
    ...kickResults.filter(Boolean),
    ...twitch.filter((t) => twitchSet.has(t.login!)).map((t) => t.name),
  ];
  return NextResponse.json({ live });
}
