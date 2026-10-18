import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { ago, formatPhone } from "../format";
import { ResetPassword } from "./ResetPassword";

export default async function AdminAccounts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (!(await currentAdmin())) return null;

  const q = String((await searchParams).q ?? "").trim().slice(0, 60);
  const escaped = q.replace(/[\\%_]/g, "\\$&");
  const digits = q.replace(/\D/g, "");
  const users = await query<{ id: string; display_name: string; phone: string; created_at: string; shops: string | null; last_activity: string | null }>(
    `select u.id, u.display_name, u.phone, u.created_at,
       (select string_agg(s.name, ', ' order by s.name) from shops s
         where s.owner_id = u.id
            or exists (select 1 from shop_members m where m.shop_id = s.id and m.user_id = u.id and m.removed_at is null)) as shops,
       (select max(e.at) from product_events e where e.user_id = u.id) as last_activity
     from users u
     where $1 = '' or u.display_name ilike '%' || $1 || '%' or ($2 <> '' and u.phone like '%' || $2 || '%')
     order by u.created_at desc
     limit 200`,
    [escaped, digits],
  );

  return (
    <>
      <PageHeader title="Comptes" aside={<span className="text-[15px] text-muted-foreground tabular-nums">{users.length}</span>} />

      <form role="search" className="mb-6 flex max-w-md gap-2">
        <Input name="q" type="search" defaultValue={q} placeholder="Nom ou numéro" aria-label="Chercher un compte" />
        <Button type="submit" variant="outline" size="touch">
          <Search aria-hidden />
          Chercher
        </Button>
      </form>

      {users.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">{q ? `Aucun compte pour « ${q} ».` : "Aucun compte pour l’instant."}</p>
      ) : (
        <ul className="divide-y border-y">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 py-3.5 md:flex-row md:items-center md:gap-6">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {u.display_name} <span className="font-normal text-muted-foreground tabular-nums">{formatPhone(u.phone)}</span>
                </p>
                <p className="truncate text-sm text-muted-foreground">{u.shops ?? "Aucune boutique"}</p>
              </div>
              <p className="text-sm text-muted-foreground md:w-56 md:text-right">
                Inscrit {ago(u.created_at)}
                <br />
                {u.last_activity ? `Actif ${ago(u.last_activity)}` : "Jamais actif"}
              </p>
              <ResetPassword userId={u.id} name={u.display_name} phone={u.phone} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
