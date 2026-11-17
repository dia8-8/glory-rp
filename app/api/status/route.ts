import { NextResponse } from 'next/server';
import { SITE } from '@/lib/site';

export const revalidate = 60; // cache for 60s

type ServerStatus = { online: boolean; players: number; max: number } | null;
type DiscordStatus = { members: number; online: number } | null;

async function getServer(): Promise<ServerStatus> {
  try {
    if (SITE.fivemCfxCode) {
      const r = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${SITE.fivemCfxCode}`, {
        headers: { 'User-Agent': 'glory-rp-site' },
        next: { revalidate: 60 },
      });
      if (!r.ok) return { online: false, players: 0, max: 0 };
      const j = await r.json();
      const d = j?.Data ?? {};
      return { online: true, players: Number(d.clients ?? 0), max: Number(d.sv_maxclients ?? d.svMaxclients ?? 0) };
    }
    if (SITE.fivemAddress) {
      const r = await fetch(`http://${SITE.fivemAddress}/dynamic.json`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) return { online: false, players: 0, max: 0 };
      const d = await r.json();
      return { online: true, players: Number(d.clients ?? 0), max: Number(d.sv_maxclients ?? 0) };
    }
  } catch {
    return { online: false, players: 0, max: 0 };
  }
  return null; // not configured
}

async function getDiscord(): Promise<DiscordStatus> {
  if (!SITE.discordInvite) return null;
  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${SITE.discordInvite}?with_counts=true`, {
      next: { revalidate: 300 },
    });
    if (!r.ok) return null;
    const j = await r.json();
    return { members: Number(j.approximate_member_count ?? 0), online: Number(j.approximate_presence_count ?? 0) };
  } catch {
    return null;
  }
}

export async function GET() {
  const [server, discord] = await Promise.all([getServer(), getDiscord()]);
  return NextResponse.json({ server, discord });
}
