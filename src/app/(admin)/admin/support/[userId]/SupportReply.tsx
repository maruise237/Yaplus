"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_MAX_LENGTH } from "@/lib/support";
import { replySupport } from "../../actions";

// Réponses toutes faites : un tap les met dans la zone de texte, à ajuster avant d'envoyer.
const SNIPPETS = [
  { label: "Bonjour", text: (name: string) => `Bonjour ${name}, merci pour ton message. ` },
  {
    label: "Ajouter un employé",
    text: () => "Va dans Boutique, puis Équipe, et touche Inviter. Envoie le lien sur WhatsApp à ton employé : il l’ouvre et voit le cahier tout de suite.",
  },
  { label: "Mot de passe", text: () => "Je viens de t’envoyer un lien sur WhatsApp. Ouvre-le pour choisir un nouveau mot de passe, il marche une seule fois." },
  { label: "C’est réglé", text: () => "C’est réglé de notre côté. Dis-nous si tu as encore un souci, on reste là." },
];

export function SupportReply({ userId, name }: { userId: string; name: string }) {
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    const result = await replySupport(userId, body).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." }));
    setError(result?.error ?? null);
    if (!result) setBody("");
    setBusy(false);
  };

  return (
    <form className="grid gap-2.5" onSubmit={(e) => (e.preventDefault(), void send())}>
      <Label htmlFor="reply">Ta réponse</Label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" aria-label="Réponses toutes faites">
        {SNIPPETS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="touch"
            className="rounded-full"
            onClick={() => {
              setBody((b) => (b.trim() ? `${b.trimEnd()} ${s.text(name)}` : s.text(name)));
              field.current?.focus();
            }}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <Textarea
        ref={field}
        id="reply"
        value={body}
        onChange={(e) => (setBody(e.target.value), setError(null))}
        maxLength={SUPPORT_MAX_LENGTH}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "reply-error" : undefined}
      />
      {error && (
        <p id="reply-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="touch" className="justify-self-start" disabled={busy || !body.trim()}>
        {busy ? "Envoi…" : "Envoyer la réponse"}
      </Button>
    </form>
  );
}
