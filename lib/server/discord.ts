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
const idList = (v?: string) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export function staffRoleIds(): string[] {
  return idList(process.env.DISCORD_STAFF_ROLE_IDS || process.env.DISCORD_INTERVIEW_REVIEW_ROLE_ID);
}

/** Admins = DISCORD_ADMIN_ROLE_IDS (comma separated). They manage site content and are also staff. */
export function adminRoleIds(): string[] {
  return idList(process.env.DISCORD_ADMIN_ROLE_IDS);
}

/** VIP admins = DISCORD_VIP_ADMIN_ROLE_IDS (comma separated). They manage the VIP store only. */
export function vipAdminRoleIds(): string[] {
  return idList(process.env.DISCORD_VIP_ADMIN_ROLE_IDS);
}

/** staff: review submissions · admin: site content (+ staff) · vipAdmin: the VIP store (admins too) */
export type Access = { staff: boolean; admin: boolean; vipAdmin: boolean };
const accessCache = new Map<string, { access: Access; at: number }>();

/** Looks up the member's roles once (cached 60s) and works out staff/admin access. */
export async function getAccess(discordId?: string | null): Promise<Access> {
  if (!discordId) return { staff: false, admin: false, vipAdmin: false };
  const hit = accessCache.get(discordId);
  if (hit && Date.now() - hit.at < 60_000) return hit.access;
  const roles = (await getMemberRoles(discordId)) ?? [];
  const has = (ids: string[]) => ids.length > 0 && roles.some((r) => ids.includes(r));
  const admin = has(adminRoleIds());
  const access = { admin, staff: admin || has(staffRoleIds()), vipAdmin: admin || has(vipAdminRoleIds()) };
  accessCache.set(discordId, { access, at: Date.now() });
  return access;
}

export async function isStaff(discordId?: string | null): Promise<boolean> {
  return (await getAccess(discordId)).staff;
}

export async function isAdmin(discordId?: string | null): Promise<boolean> {
  return (await getAccess(discordId)).admin;
}

export async function isVipAdmin(discordId?: string | null): Promise<boolean> {
  return (await getAccess(discordId)).vipAdmin;
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
