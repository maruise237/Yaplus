import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { ago, formatPhone } from "./format";

const ACTIONS: Record<string, string> = {
  sign_in: "Connexion",
  sign_out: "Déconnexion",
  reset_password: "Mot de passe remplacé",
  reset_link_created: "Lien de mot de passe créé",
  reset_link_cancelled: "Lien de mot de passe annulé",
  support_number_changed: "Numéro du support changé",
};

export default async function AdminOverview() {
  if (!(await currentAdmin())) return null;

  const [[m], events] = await Promise.all([
    query<{ users: number; users_7d: number; shops: number; active: number; with_employee: number; closed: number; flags: number }>(`
      with recent as (
        select shop_id, user_id from product_events where at > now() - interval '7 days'
        union all
        select shop_id, closed_by from closures where closed_at > now() - interval '7 days'
      )
      select
        (select count(*)::int from users) as users,
        (select count(*)::int from users where created_at > now() - interval '7 days') as users_7d,
        (select count(*)::int from shops where archived_at is null) as shops,
        (select count(distinct shop_id)::int from recent) as active,
        (select count(distinct r.shop_id)::int from recent r
           join shop_members sm on sm.shop_id = r.shop_id and sm.user_id = r.user_id and sm.role = 'employee') as with_employee,
        (select count(distinct shop_id)::int from closures where closed_at > now() - interval '7 days') as closed,
        (select count(*)::int from product_events where type = 'flagged' and at > now() - interval '7 days') as flags`),
    query<{ at: string; action: string; admin_name: string; target_name: string | null; target_phone: string | null; ip: string | null }>(`
      select e.at, e.action, a.display_name as admin_name, t.display_name as target_name, t.phone as target_phone, e.ip
      from admin_events e
      join users a on a.id = e.admin_id
      left join users t on t.id::text = e.target
      order by e.at desc limit 20`),
  ]);

  // Seuils de la v1 (docs/PRD.md, « Métriques de la v1 »).
  const rows = [
    { label: "Boutiques actives", hint: "Un signalement ou une clôture", value: m.active, of: m.shops, target: "Toutes" },
    { label: "Boutiques avec un employé actif", hint: "Au moins 1 par boutique", value: m.with_employee, of: m.shops, target: "Toutes" },
    { label: "Boutiques qui ont clôturé", hint: "Au moins 1 liste par boutique", value: m.closed, of: m.shops, target: "Toutes" },
    { label: "Produits signalés", hint: "Toutes boutiques", value: m.flags },
    { label: "Nouveaux comptes", hint: `${m.users} au total`, value: m.users_7d },
  ];

  return (
    <>
      <PageHeader title="Vue d’ensemble" />

      <section aria-labelledby="week" className="max-w-3xl">
        <h2 id="week" className="text-lg font-semibold">
          Les 7 derniers jours
        </h2>
        <table className="mt-3 w-full text-left text-[15px]">
          <thead className="sr-only">
            <tr>
              <th>Mesure</th>
              <th>Valeur</th>
              <th>Visé</th>
            </tr>
          </thead>
          <tbody className="divide-y border-y">
            {rows.map((r) => {
              const met = r.of !== undefined && r.of > 0 && r.value >= r.of;
              return (
                <tr key={r.label}>
                  <td className="py-3.5 pr-4">
                    <span className="block font-medium">{r.label}</span>
                    <span className="block text-sm text-muted-foreground">{r.hint}</span>
                  </td>
                  <td className={cn("py-3.5 text-right text-lg font-semibold tabular-nums", met && "text-success-text")}>
                    {r.value}
                    {r.of !== undefined && <span className="text-[15px] font-normal text-muted-foreground"> sur {r.of}</span>}
                  </td>
                  <td className="hidden w-32 py-3.5 pl-6 text-sm text-muted-foreground sm:table-cell">{r.target && `Visé : ${r.target.toLowerCase()}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="log" className="mt-12 max-w-3xl">
        <h2 id="log" className="text-lg font-semibold">
          Journal admin
        </h2>
        {events.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted-foreground">Rien pour l’instant.</p>
        ) : (
          <ul className="mt-3 divide-y border-y">
            {events.map((e, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3 text-[15px]">
                <span>
                  <span className="font-medium">{ACTIONS[e.action] ?? e.action}</span>
                  {e.target_name && (
                    <span className="text-muted-foreground">
                      {" "}
                      pour {e.target_name} ({e.target_phone && formatPhone(e.target_phone)})
                    </span>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {e.admin_name}, {ago(e.at)}
                  {e.ip && <span className="tabular-nums">, {e.ip}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
