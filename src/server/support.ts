import "server-only";
import { isSupportTopic, type SupportMessage } from "@/lib/support";
import { query } from "./db";

// Conversation de support d'un compte, et s'il y a une réponse pas encore lue.
export async function supportThread(userId: string) {
  const [thread] = await query<{ user_seen_at: string | null; closed_at: string | null }>("select user_seen_at, closed_at from support_threads where user_id = $1", [userId]);
  const messages = await query<{ id: string; from_admin: boolean; body: string; at: string; topic: string | null }>(
    "select id::text, from_admin, body, at, topic from support_messages where user_id = $1 order by at, id",
    [userId],
  );
  const seen = thread?.user_seen_at ? new Date(thread.user_seen_at).getTime() : 0;
  return {
    messages: messages.map((m): SupportMessage => ({ id: m.id, fromAdmin: m.from_admin, body: m.body, at: new Date(m.at).toISOString(),
      topic: isSupportTopic(m.topic) ? m.topic : null,
    })),
    closedAt: thread?.closed_at ? new Date(thread.closed_at).toISOString() : null,
    unread: messages.some((m) => m.from_admin && new Date(m.at).getTime() > seen),
  };
}
