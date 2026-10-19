"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { cancelResetLink, createResetLink } from "../actions";

// Mot de passe oublié : après vérification sur WhatsApp, on crée un lien à usage unique
// et on l'envoie au numéro du compte. Le lien n'est montré qu'ici, une seule fois.
export function ResetLink({ userId, name, phone, phoneLabel, expiresIn }: { userId: string; name: string; phone: string; phoneLabel: string; expiresIn: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    setBusy(true);
    setError(null);
    const result = await createResetLink(userId).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." }));
    if ("token" in result) setUrl(`${window.location.origin}/nouveau-mot-de-passe#${result.token}`);
    else setError(result.error);
    setBusy(false);
  };

  const cancel = async () => {
    setBusy(true);
    const result = await cancelResetLink(userId).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." }));
    setError(result?.error ?? null);
    if (!result) setUrl(null);
    setBusy(false);
  };

  const cancelButton = (
    <Button variant="ghost" size="touch" className="text-muted-foreground" disabled={busy} onClick={() => void cancel()}>
      Annuler le lien
    </Button>
  );

  let body: React.ReactNode;
  if (url) {
    const message = `Bonjour ${name}, voici ton lien pour choisir un nouveau mot de passe Yaplus. Il marche une seule fois, pendant 24 heures :\n${url}`;
    body = (
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <a href={whatsappLink(message, phone)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "touch" }))}>
          <WhatsAppIcon aria-hidden />
          Envoyer sur WhatsApp
        </a>
        <Button
          variant="outline"
          size="icon-touch"
          aria-label={copied ? "Lien copié" : "Copier le lien"}
          onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
        {cancelButton}
      </div>
    );
  } else if (expiresIn) {
    body = (
      <div className="flex flex-wrap items-center gap-x-2 md:justify-end">
        <span className="text-sm text-muted-foreground">Lien actif, expire {expiresIn}</span>
        {cancelButton}
      </div>
    );
  } else {
    body = (
      <Button variant="ghost" size="touch" className="-ml-4 self-start text-primary md:ml-0 md:self-auto" disabled={busy} onClick={() => setConfirming(true)}>
        <KeyRound aria-hidden />
        {busy ? "Création…" : "Lien de mot de passe"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1 md:items-end">
      {body}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Créer un lien pour ${name} ?`}
        description={
          <div className="grid gap-2">
            <p>Vérifie d’abord que la demande vient bien du {phoneLabel}. Sinon, demande le nom de sa boutique et celui d’un employé.</p>
            <p>Le lien s’envoie sur ce numéro. Il marche une seule fois, pendant 24 heures, et tu peux l’annuler.</p>
          </div>
        }
        confirmLabel="Créer le lien"
        onConfirm={create}
      />
    </div>
  );
}
