"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

// Collée en bas de l'écran : on lit la conversation et on répond sans faire défiler.
// À l'ouverture et après chaque envoi, la page descend au dernier message.
export function SupportReply({ userId, name, count }: { userId: string; name: string; count: number }) {
  const [body, setBody] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => window.scrollTo({ top: document.documentElement.scrollHeight }), [count]);

  const send = async () => {
    setBusy(true);
    const result = await replySupport(userId, body).catch(() => ({ error: "Le serveur ne répond pas. Réessaie." }));
    setError(result?.error ?? null);
    if (!result) setBody("");
    setBusy(false);
  };

  return (
    <form
      className="sticky bottom-0 -mx-4 grid gap-2.5 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none"
      onSubmit={(e) => (e.preventDefault(), void send())}
    >
      <Label htmlFor="reply" className="max-md:sr-only">
        Ta réponse
      </Label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" aria-label="Réponses toutes faites">
        {SNIPPETS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="touch"
            className="shrink-0 rounded-full"
            onClick={() => {
              setBody((b) => (b.trim() ? `${b.trimEnd()} ${s.text(name)}` : s.text(name)));
              field.current?.focus();
            }}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <Textarea
          ref={field}
          id="reply"
          value={body}
          onChange={(e) => (setBody(e.target.value), setError(null))}
          maxLength={SUPPORT_MAX_LENGTH}
          placeholder="Écris ta réponse…"
          className="max-h-40 min-h-12"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "reply-error" : undefined}
        />
        <Button type="submit" size="icon-touch" className="size-12 shrink-0 rounded-full" disabled={busy || !body.trim()} aria-label={busy ? "Envoi…" : "Envoyer la réponse"}>
          <ArrowUp aria-hidden />
        </Button>
      </div>
      {error && (
        <p id="reply-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
