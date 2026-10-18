"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShop, SHOP_TEMPLATES } from "@/lib/actions";
import { useSession } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Template = keyof typeof SHOP_TEMPLATES;

const TEMPLATE_LABELS: Record<Template, string> = {
  telephonie: "Téléphonie",
  alimentation: "Alimentation",
  quincaillerie: "Quincaillerie",
  vide: "Je crée mes catégories",
};

export default function BienvenuePage() {
  const router = useRouter();
  const session = useSession();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<Template>("telephonie");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError(true);
    setBusy(true);
    await createShop(name, template);
    router.replace("/");
  };

  return (
    <div className="grid gap-8">
      <Wordmark />
      <div>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">Bienvenue{session ? `, ${session.displayName}` : ""}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Crée le cahier de ta boutique. Tu inviteras tes employés ensuite.</p>
      </div>

      <form className="grid gap-6" onSubmit={(e) => (e.preventDefault(), submit())}>
        <div className="grid gap-2.5">
          <Label htmlFor="shop-name">Nom de la boutique</Label>
          <Input
            id="shop-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(false);
            }}
            placeholder="Ex. Boutique Akwa…"
            autoComplete="organization"
            aria-invalid={error}
          />
          {error && <p className="text-sm text-destructive">Donne un nom à la boutique.</p>}
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Catégories de départ</legend>
          <p className="mb-3 text-sm text-muted-foreground">Tu pourras les renommer ou en ajouter.</p>
          <div className="divide-y overflow-hidden rounded-xl border bg-card" role="radiogroup">
            {(Object.keys(SHOP_TEMPLATES) as Template[]).map((t) => {
              const selected = template === t;
              return (
                <button
                  type="button"
                  key={t}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTemplate(t)}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{TEMPLATE_LABELS[t]}</span>
                    {SHOP_TEMPLATES[t].length > 0 && <span className="block truncate text-sm text-muted-foreground">{SHOP_TEMPLATES[t].join(", ")}</span>}
                  </span>
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-150",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                    )}
                    aria-hidden
                  >
                    {selected && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Button type="submit" size="touch-lg" disabled={busy}>
          {busy ? "Création…" : "Créer la boutique"}
        </Button>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        Ton patron t’a invité ?{" "}
        <Link href="/rejoindre" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrer un code
        </Link>
      </p>
    </div>
  );
}
