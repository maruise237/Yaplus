"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createShop, SHOP_TEMPLATES } from "@/lib/actions";
import { useSession } from "@/lib/hooks";

const TEMPLATE_LABELS: Record<keyof typeof SHOP_TEMPLATES, string> = {
  telephonie: "Téléphonie",
  alimentation: "Alimentation",
  quincaillerie: "Quincaillerie",
  vide: "Cahier vide",
};

export default function BienvenuePage() {
  const router = useRouter();
  const session = useSession();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<keyof typeof SHOP_TEMPLATES>("telephonie");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await createShop(name, template);
    router.replace("/");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Bienvenue{session ? `, ${session.displayName}` : ""}</h1>
        <p className="mt-2 text-muted">Crée le cahier de ta boutique. Tu pourras inviter tes employés ensuite.</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), submit())}>
        <input
          className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-lg outline-none focus:border-brand"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la boutique"
          autoFocus
        />
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Catégories de départ</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SHOP_TEMPLATES) as (keyof typeof SHOP_TEMPLATES)[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTemplate(t)}
                className={`rounded-2xl border px-3 py-3 text-left ${template === t ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
              >
                <div className="font-semibold">{TEMPLATE_LABELS[t]}</div>
                <div className="truncate text-xs text-muted">{SHOP_TEMPLATES[t].join(", ") || "Tu crées tes pages"}</div>
              </button>
            ))}
          </div>
        </div>
        <button className="w-full rounded-2xl bg-brand px-4 py-4 text-lg font-semibold text-brand-ink disabled:opacity-50" disabled={busy || !name.trim()}>
          Créer la boutique
        </button>
      </form>

      <Link href="/rejoindre" className="block rounded-2xl border border-line bg-surface px-4 py-4 text-center font-medium">
        J&apos;ai un code d&apos;invitation
      </Link>
    </div>
  );
}
