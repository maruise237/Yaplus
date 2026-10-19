import { PageHeader } from "@/components/PageHeader";
import { currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { ago, formatPhone, plural } from "../format";

export default async function AdminShops() {
  if (!(await currentAdmin())) return null;

  const shops = await query<{
    id: string;
    name: string;
    archived_at: string | null;
    owner_name: string;
    owner_phone: string;
    members: number;
    products: number;
    to_buy: number;
    last_activity: string | null;
    last_closure: string | null;
  }>(`
    select s.id, s.name, s.archived_at, u.display_name as owner_name, u.phone as owner_phone,
      (select count(*)::int from shop_members m where m.shop_id = s.id and m.removed_at is null) as members,
      (select count(*)::int from products p where p.shop_id = s.id and p.archived_at is null) as products,
      (select count(*)::int from products p where p.shop_id = s.id and p.archived_at is null and p.status = 'to_buy') as to_buy,
      (select max(e.at) from product_events e where e.shop_id = s.id) as last_activity,
      (select max(c.closed_at) from closures c where c.shop_id = s.id) as last_closure
    from shops s
    join users u on u.id = s.owner_id
    order by greatest(
      (select max(e.at) from product_events e where e.shop_id = s.id),
      (select max(c.closed_at) from closures c where c.shop_id = s.id),
      s.created_at
    ) desc
    limit 200`);

  return (
    <>
      <PageHeader title="Boutiques" aside={<span className="text-[15px] text-muted-foreground tabular-nums">{shops.length}</span>} />
      {shops.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">Aucune boutique pour l’instant.</p>
      ) : (
        <table className="w-full text-left text-[15px]">
          <thead className="hidden text-sm text-muted-foreground md:table-header-group">
            <tr className="border-b">
              <th className="py-2.5 pr-4 font-medium">Boutique</th>
              <th className="py-2.5 pr-4 font-medium">Patron</th>
              <th className="py-2.5 pr-4 text-right font-medium">Membres</th>
              <th className="py-2.5 pr-4 text-right font-medium">Produits</th>
              <th className="py-2.5 pr-4 text-right font-medium">À racheter</th>
              <th className="py-2.5 pr-4 font-medium">Activité</th>
              <th className="py-2.5 font-medium">Clôture</th>
            </tr>
          </thead>
          <tbody className="divide-y border-y md:border-t-0">
            {shops.map((s) => (
              <tr key={s.id} className="grid grid-cols-[1fr_auto] gap-x-4 py-3.5 md:table-row md:py-0">
                <td className="font-medium md:py-3.5 md:pr-4">
                  {s.name}
                  {s.archived_at && <span className="ml-2 text-sm font-normal text-muted-foreground">archivée</span>}
                </td>
                <td className="col-start-1 text-muted-foreground md:py-3.5 md:pr-4 md:text-foreground">
                  {s.owner_name} <span className="text-muted-foreground tabular-nums whitespace-nowrap">{formatPhone(s.owner_phone)}</span>
                </td>
                <td className="col-start-1 text-sm text-muted-foreground md:hidden">
                  {plural(s.members, "membre", "membres")}, {plural(s.products, "produit", "produits")}, {s.to_buy} à racheter
                </td>
                <td className="hidden text-right tabular-nums md:table-cell md:py-3.5 md:pr-4">{s.members}</td>
                <td className="hidden text-right tabular-nums md:table-cell md:py-3.5 md:pr-4">{s.products}</td>
                <td className="hidden text-right tabular-nums md:table-cell md:py-3.5 md:pr-4">{s.to_buy}</td>
                <td className="col-start-2 row-start-1 text-right text-sm text-muted-foreground md:py-3.5 md:pr-4 md:text-left md:text-[15px] md:text-foreground">
                  <span className="md:hidden">{s.last_activity ? `Actif ${ago(s.last_activity)}` : "Jamais actif"}</span>
                  <span className="hidden md:inline">{ago(s.last_activity)}</span>
                </td>
                <td className="col-start-2 row-start-2 text-right text-sm text-muted-foreground md:py-3.5 md:text-left md:text-[15px] md:text-foreground">
                  <span className="md:hidden">{s.last_closure ? `Clôturé ${ago(s.last_closure)}` : "Jamais clôturé"}</span>
                  <span className="hidden md:inline">{ago(s.last_closure)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
