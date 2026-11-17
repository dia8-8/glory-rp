/**
 * Site-wide settings. Values come from environment variables so they can be
 * changed on Vercel without touching code. Anything left empty is hidden on the site.
 *
 *   NEXT_PUBLIC_FIVEM_CFX_CODE   your cfx.re join code, e.g. "abc123" (from cfx.re/join/abc123)
 *   NEXT_PUBLIC_FIVEM_ADDRESS    or a direct "ip:port" if you have no cfx code
 *   NEXT_PUBLIC_SITE_URL         full site URL, used for link previews
 */
import { BRAND } from './brand';

export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  fivemCfxCode: process.env.NEXT_PUBLIC_FIVEM_CFX_CODE || '',
  fivemAddress: process.env.NEXT_PUBLIC_FIVEM_ADDRESS || '',
  discordInvite: BRAND.discord.split('/').pop() || '',
  /** Shown when the live Discord count can't be fetched */
  fallbackMembers: 3200,
  fallbackFollowers: 300,
};

/** fivem:// link that opens FiveM and joins the server, or '' if not configured */
export function fivemConnectUrl() {
  if (SITE.fivemCfxCode) return `fivem://connect/cfx.re/join/${SITE.fivemCfxCode}`;
  if (SITE.fivemAddress) return `fivem://connect/${SITE.fivemAddress}`;
  return '';
}
