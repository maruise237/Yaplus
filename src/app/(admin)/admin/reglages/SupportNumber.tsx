"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappLink } from "@/lib/whatsapp";
import { saveSupportWhatsapp } from "../actions";

export function SupportNumber({ current, currentLabel }: { current: string | null; currentLabel: string | null }) {
  const [value, setValue] = useState(currentLabel ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setBusy(true);
    const result = await saveSupportWhatsapp(value).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." }));
    setError(result?.error ?? null);
    setSaved(!result);
    setBusy(false);
  };

  return (
    <form className="mt-4 grid gap-2.5" onSubmit={(e) => (e.preventDefault(), void save())}>
      <Label htmlFor="support-phone">Numéro WhatsApp</Label>
      <Input
        id="support-phone"
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => (setValue(e.target.value), setError(null), setSaved(false))}
        placeholder="6 99 00 11 22"
        className="max-w-xs"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "support-phone-error" : saved ? "support-phone-saved" : undefined}
      />
      {error && (
        <p id="support-phone-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p id="support-phone-saved" className="text-sm text-success-text" role="status">
          {value.trim() ? "Enregistré. L’app l’utilise d’ici une minute." : "Numéro retiré. Les boutons WhatsApp du support sont cachés."}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="touch" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {current && (
          <Button variant="ghost" size="touch" className="text-primary" asChild>
            <a href={whatsappLink("Test du support Yaplus", current)} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              Tester
            </a>
          </Button>
        )}
      </div>
    </form>
  );
}
