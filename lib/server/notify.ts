// On-site notifications (bell in the navbar). Server only.
import { db } from './db';
import type { Message } from './messages';

export const NOTIFY_TABLE = 'notifications';

export type Notification = {
  id: string;
  discord_id: string;
  icon: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  note: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/** Best effort: never throws, so a notification problem can't break a form or a staff decision. */
export async function notify(discordId: string, m: Message, note?: string | null): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const { error } = await client.from(NOTIFY_TABLE).insert({
    discord_id: discordId,
    icon: m.icon,
    title_en: m.title.en,
    title_ar: m.title.ar,
    body_en: m.body.en,
    body_ar: m.body.ar,
    note: note || null,
    link: m.link,
  });
  if (error) console.error('[notify] insert failed:', error.message);
  return !error;
}
