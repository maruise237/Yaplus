import { ChevronLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { isSupportTopic, SUPPORT_TOPICS } from "@/lib/support";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import { adminConfig, currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { setSupportClosed } from "../../actions";
import { ago, formatPhone } from "../../format";
import { SupportReply } from "./SupportReply";

export default async function AdminSupportThread({ params }: { params: Promise<{ userId: string }> }) {
  const config = adminConfig();
  if (!config || !(await currentAdmin())) return null;
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();

  const [[thread], messages] = await Promise.all([
    query<{ display_name: string; phone: string; closed_at: string | null; shops: string | null }>(
      `select u.display_name, u.phone, t.closed_at,
         (select string_agg(s.name, ', ' order by s.name) from shops s
           where s.owner_id = u.id
              or exists (select 1 from shop_members m where m.shop_id = s.id and m.user_id = u.id and m.removed_at is null)) as shops
       from support_threads t join users u on u.id = t.user_id where t.user_id = $1`,
      [userId],
    ),
    query<{ id: string; from_admin: boolean; author_name: string; body: string; at: string; shop_name: string | null; topic: string | null }>(
      `select m.id::text, m.from_admin, a.display_name as author_name, m.body, m.at, s.name as shop_name, m.topic
       from support_messages m join users a on a.id = m.author_id left join shops s on s.id = m.shop_id
       where m.user_id = $1 order by m.at, m.id`,
      [userId],
    ),
  ]);
  if (!thread) notFound();

  const notify = `Bonjour ${thread.display_name}, le support Yaplus t’a répondu. Ouvre Yaplus, onglet Boutique, puis Aide.`;

  return (
    <div className="max-w-2xl max-md:flex max-md:-mb-[calc(6rem+env(safe-area-inset-bottom))] max-md:min-h-[calc(100dvh-5rem)] max-md:flex-col">
      <PageHeader
        title={thread.display_name}
        leading={
          <Link href={`${config.base}/support`} className={cn(buttonVariants({ variant: "ghost", size: "icon-touch" }), "-ml-3")} aria-label="Retour au support">
            <ChevronLeft aria-hidden />
          </Link>
        }
      />
      <div className="-mt-3 mb-6 grid gap-1 md:-mt-5">
        <p className="text-[15px] text-muted-foreground">
          <span className="tabular-nums">{formatPhone(thread.phone)}</span>
          {thread.shops && <span>, {thread.shops}</span>}
        </p>
        {thread.closed_at && <p className="text-sm text-muted-foreground">Réglé {ago(thread.closed_at)}</p>}
        <div className="-ml-4 flex flex-wrap items-center gap-x-1">
          <a href={whatsappLink(notify, thread.phone)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "touch" }), "text-primary")}>
            <WhatsAppIcon aria-hidden />
            Le prévenir sur WhatsApp
          </a>
          <form action={setSupportClosed.bind(null, userId, !thread.closed_at)}>
            <Button type="submit" variant="ghost" size="touch" className="text-muted-foreground">
              {thread.closed_at ? "Rouvrir" : "Marquer comme réglé"}
            </Button>
          </form>
        </div>
      </div>

      <ol className="mb-6 grid content-start gap-3 max-md:flex-1" aria-label="Messages">
        {messages.map((m) => (
          <li key={m.id} className={cn("max-w-[85%] rounded-xl px-4 py-3", m.from_admin ? "ml-auto bg-secondary" : "border bg-card")}>
            <p className="text-sm text-muted-foreground">
              {m.from_admin ? `Support (${m.author_name})` : m.author_name}, {ago(m.at)}
              {m.shop_name && !m.from_admin && <span>, {m.shop_name}</span>}
            </p>
            {isSupportTopic(m.topic) && <p className="mt-1 text-sm font-medium text-primary">{SUPPORT_TOPICS[m.topic]}</p>}
            <p className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
      </ol>

      <SupportReply userId={userId} name={thread.display_name} count={messages.length} />
    </div>
  );
}
