import { PageHeader } from "@/components/PageHeader";
import { currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { ago, formatPhone } from "../format";
import { SupportNumber } from "./SupportNumber";

export default async function AdminSettings() {
  if (!(await currentAdmin())) return null;
  const [row] = await query<{ value: string; updated_at: string; updated_by: string | null }>(
    `select s.value, s.updated_at, u.display_name as updated_by
     from app_settings s left join users u on u.id = s.updated_by where s.key = 'support_whatsapp'`,
  );

  return (
    <div className="max-w-xl">
      <PageHeader title="Réglages" />
      <section aria-labelledby="support-number">
        <h2 id="support-number" className="text-lg font-semibold">
          WhatsApp du support
        </h2>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Reçoit les demandes « Mot de passe oublié » et les messages envoyés depuis Aide. Sans numéro, ces boutons sont cachés dans l’app.
        </p>
        <SupportNumber current={row?.value ?? null} currentLabel={row ? formatPhone(row.value) : null} />
        {row && (
          <p className="mt-3 text-sm text-muted-foreground">
            Changé {ago(row.updated_at)}
            {row.updated_by && ` par ${row.updated_by}`}
          </p>
        )}
      </section>
    </div>
  );
}
