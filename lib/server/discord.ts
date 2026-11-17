// Server-only Discord bot helpers (uses DISCORD_BOT_TOKEN / DISCORD_GUILD_ID).
const API = 'https://discord.com/api/v10';

function headers() {
  return { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' };
}

export async function getMemberRoles(discordId: string): Promise<string[] | null> {
  const guild = process.env.DISCORD_GUILD_ID;
  if (!guild || !process.env.DISCORD_BOT_TOKEN) return null;
  try {
    const r = await fetch(`${API}/guilds/${guild}/members/${discordId}`, { headers: headers(), cache: 'no-store' });
    if (!r.ok) return null;
    return ((await r.json()).roles as string[]) ?? [];
  } catch {
    return null;
  }
}

/**
 * Staff = anyone with a role listed in DISCORD_STAFF_ROLE_IDS (comma separated),
 * falling back to DISCORD_INTERVIEW_REVIEW_ROLE_ID (the role pinged for interviews).
 */
export function staffRoleIds(): string[] {
  const list = (process.env.DISCORD_STAFF_ROLE_IDS || process.env.DISCORD_INTERVIEW_REVIEW_ROLE_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list;
}

const staffCache = new Map<string, { ok: boolean; at: number }>();

export async function isStaff(discordId?: string | null): Promise<boolean> {
  if (!discordId) return false;
  const hit = staffCache.get(discordId);
  if (hit && Date.now() - hit.at < 60_000) return hit.ok;
  const roles = await getMemberRoles(discordId);
  const ids = staffRoleIds();
  const ok = !!roles && ids.length > 0 && roles.some((r) => ids.includes(r));
  staffCache.set(discordId, { ok, at: Date.now() });
  return ok;
}

export async function addRole(discordId: string, roleId?: string) {
  const guild = process.env.DISCORD_GUILD_ID;
  if (!guild || !roleId) return false;
  const r = await fetch(`${API}/guilds/${guild}/members/${discordId}/roles/${roleId}`, {
    method: 'PUT',
    headers: { ...headers(), 'X-Audit-Log-Reason': 'Glory RP staff dashboard' },
  }).catch(() => null);
  return !!r?.ok;
}

export async function removeRole(discordId: string, roleId?: string) {
  const guild = process.env.DISCORD_GUILD_ID;
  if (!guild || !roleId) return false;
  const r = await fetch(`${API}/guilds/${guild}/members/${discordId}/roles/${roleId}`, {
    method: 'DELETE',
    headers: { ...headers(), 'X-Audit-Log-Reason': 'Glory RP staff dashboard' },
  }).catch(() => null);
  return !!r?.ok;
}

/** Sends a DM. Returns false if the user has DMs closed. */
export async function sendDM(discordId: string, content: string) {
  try {
    const ch = await fetch(`${API}/users/@me/channels`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ recipient_id: discordId }),
    });
    if (!ch.ok) return false;
    const { id } = await ch.json();
    const r = await fetch(`${API}/channels/${id}/messages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ content: content.slice(0, 2000), allowed_mentions: { parse: [] } }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
