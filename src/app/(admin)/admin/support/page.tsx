import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { adminConfig, currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { ago, formatPhone } from "../format";

export default async function AdminSupport() {
  const config = adminConfig();
  if (!config || !(await currentAdmin())) return null;

  const threads = await query<{
    user_id: string;
    display_name: string;
    phone: string;
    last_at: string;
    closed_at: string | null;
    last_body: string;
    last_from_admin: boolean;
    shop_name: string | null;
  }>(`
    select t.user_id, u.display_name, u.phone, t.last_at, t.closed_at, last.body as last_body, last.from_admin as last_from_admin,
      (select s.name from support_messages m join shops s on s.id = m.shop_id
        where m.user_id = t.user_id order by m.at desc limit 1) as shop_name
    from support_threads t
    join users u on u.id = t.user_id
    cross join lateral (
      select m.body, m.from_admin from support_messages m where m.user_id = t.user_id order by m.at desc, m.id desc limit 1
    ) last
    order by (t.closed_at is null and not last.from_admin) desc, (t.closed_at is null) desc, t.last_at desc
    limit 200`);

  return (
    <>
      <PageHeader title="Support" aside={<span className="text-[15px] text-muted-foreground tabular-nums">{threads.length}</span>} />
      {threads.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">Aucun message pour l’instant. Les comptes écrivent depuis Boutique, puis Aide.</p>
      ) : (
        <ul className="max-w-3xl divide-y border-y">
          {threads.map((t) => {
            const waiting = !t.closed_at && !t.last_from_admin;
            return (
              <li key={t.user_id}>
                <Link
                  href={`${config.base}/support/${t.user_id}`}
                  className="-mx-3 flex flex-col gap-1 rounded-lg px-3 py-3.5 transition-colors hover:bg-secondary/60 md:flex-row md:items-baseline md:gap-6"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {t.display_name} <span className="font-normal text-muted-foreground tabular-nums">{formatPhone(t.phone)}</span>
                    </span>
                    <span className={cn("block truncate text-[15px]", waiting ? "text-foreground" : "text-muted-foreground")}>
                      {t.last_from_admin && "Toi : "}
                      {t.last_body}
                    </span>
                    {t.shop_name && <span className="block truncate text-sm text-muted-foreground">{t.shop_name}</span>}
                  </span>
                  <span className="text-sm md:w-40 md:text-right">
                    <span className={cn("font-medium", waiting ? "text-primary" : "text-muted-foreground")}>
                      {t.closed_at ? "Réglé" : waiting ? "À répondre" : "Répondu"}
                    </span>
                    <span className="text-muted-foreground">, {ago(t.last_at)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
