"use client";

import { Check, Copy, KeyRound, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { resetPassword } from "../actions";

// Pour un compte qui a oublié son mot de passe : on en crée un nouveau, montré une seule fois,
// à envoyer à la personne sur WhatsApp.
export function ResetPassword({ userId, name, phone }: { userId: string; name: string; phone: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ password: string } | { error: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(await resetPassword(userId).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." })));
    setBusy(false);
  };

  if (result && "password" in result) {
    const message = `Bonjour ${name}, ton nouveau mot de passe Yaplus : ${result.password}`;
    return (
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <span className="mr-1 text-lg font-semibold tracking-[0.15em] tabular-nums" aria-label={`Nouveau mot de passe : ${result.password.split("").join(" ")}`}>
          {result.password}
        </span>
        <Button
          variant="outline"
          size="icon-touch"
          aria-label={copied ? "Copié" : "Copier le mot de passe"}
          onClick={() => void navigator.clipboard.writeText(result.password).then(() => setCopied(true))}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
        <a href={whatsappLink(message, phone)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "touch" }))}>
          <MessageCircle aria-hidden />
          Envoyer sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 md:items-end">
      <Button variant="ghost" size="touch" className="-ml-4 self-start text-primary md:ml-0 md:self-auto" disabled={busy} onClick={() => setConfirming(true)}>
        <KeyRound aria-hidden />
        {busy ? "Création…" : "Nouveau mot de passe"}
      </Button>
      {result && (
        <p className="text-sm text-destructive" role="alert">
          {result.error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Nouveau mot de passe pour ${name}\u00a0?`}
        description="L’ancien ne marchera plus. Le nouveau s’affiche une seule fois : envoie-le tout de suite."
        confirmLabel="Créer le mot de passe"
        onConfirm={run}
      />
    </div>
  );
}
