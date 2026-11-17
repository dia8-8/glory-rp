/**
 * Site-wide settings. Values come from environment variables so they can be
 * changed on Vercel without touching code. Anything left empty is hidden on the site.
 *
 *   NEXT_PUBLIC_FIVEM_CFX_CODE   your cfx.re join code, e.g. "abc123" (from cfx.re/join/abc123)
 *   NEXT_PUBLIC_FIVEM_ADDRESS    or a direct "ip:port" if you have no cfx code
 */
import { BRAND } from './brand';

export const SITE = {
  /** Public address of the live site — used in Discord DMs and link previews. No trailing slash. */
  url: 'https://gloryrp.vercel.app',
  fivemCfxCode: process.env.NEXT_PUBLIC_FIVEM_CFX_CODE || '',
  fivemAddress: process.env.NEXT_PUBLIC_FIVEM_ADDRESS || '',
  discordInvite: BRAND.discord.split('/').pop() || '',
  /** Shown when the live Discord count can't be fetched */
  fallbackMembers: 4100,
  /** TikTok has no public follower API, so this number is always shown — update it by hand */
  fallbackFollowers: 450,
};

/** fivem:// link that opens FiveM and joins the server, or '' if not configured */
export function fivemConnectUrl() {
  if (SITE.fivemCfxCode) return `fivem://connect/cfx.re/join/${SITE.fivemCfxCode}`;
  if (SITE.fivemAddress) return `fivem://connect/${SITE.fivemAddress}`;
  return '';
}
