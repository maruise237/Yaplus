"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_MAX_LENGTH } from "@/lib/support";
import { replySupport } from "../../actions";

export function SupportReply({ userId }: { userId: string }) {
  const [body, setBody] = useState("");
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
      <Textarea
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
