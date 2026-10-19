"use client";

import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSupportWhatsapp } from "@/hooks/use-support-whatsapp";
import { isCloudConfigured } from "@/lib/cloud";
import { loadSupport, sendSupport, SUPPORT_MAX_LENGTH, type SupportMessage } from "@/lib/support";
import { whatsappLink } from "@/lib/whatsapp";

const time = (at: string) => new Date(at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Une conversation par compte avec le support Yaplus ; les réponses arrivent ici.
export function SupportSheet({ open, onOpenChange, shopId, onSeen }: { open: boolean; onOpenChange: (o: boolean) => void; shopId: string; onSeen: () => void }) {
  const [messages, setMessages] = useState<SupportMessage[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const supportWhatsapp = useSupportWhatsapp();

  useEffect(() => {
    if (!open || !isCloudConfigured) return;
    loadSupport(true)
      .then((t) => (setMessages(t.messages), onSeen()))
      .catch(() => setMessages((m) => m ?? []));
  }, [open, onSeen]);

  // Le dernier message en vue, comme dans WhatsApp.
  useLayoutEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      setMessages((await sendSupport(body, shopId)).messages);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Le message n’est pas parti.");
    } finally {
      setBusy(false);
    }
  };

  const whatsapp = supportWhatsapp && (
    <Button variant="ghost" size="touch" className="text-primary" asChild>
      <a href={whatsappLink("Bonjour Yaplus, ", supportWhatsapp)} target="_blank" rel="noreferrer">
        <WhatsAppIcon aria-hidden />
        Plutôt sur WhatsApp
      </a>
    </Button>
  );

  if (!isCloudConfigured) {
    return (
      <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Écrire au support" footer={whatsapp}>
        <p className="text-sm text-muted-foreground">Les messages au support s’activent quand le serveur est branché.</p>
      </ResponsiveSheet>
    );
  }

  const last = messages?.at(-1);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Écrire au support"
      description="Une question, un souci ? Écris-nous, la réponse arrive ici."
      footer={
        <Button size="touch-lg" form="support-form" type="submit" disabled={busy || !body.trim()}>
          {busy ? "Envoi…" : "Envoyer"}
        </Button>
      }
    >
      <div className="grid gap-4">
        {messages === null ? (
          <Skeleton className="h-16 w-3/4" />
        ) : (
          messages.length > 0 && (
            <ol ref={list} className="-mx-1 grid max-h-[30dvh] gap-2.5 overflow-y-auto px-1" aria-label="Messages">
              {messages.map((m) => (
                <li key={m.id} className={m.fromAdmin ? "mr-8 rounded-xl border bg-card px-3.5 py-2.5" : "ml-8 rounded-xl bg-secondary px-3.5 py-2.5"}>
                  <p className="text-sm text-muted-foreground">
                    {m.fromAdmin ? "Support Yaplus" : "Toi"}, {time(m.at)}
                  </p>
                  <p className="mt-0.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ol>
          )
        )}
        {last && !last.fromAdmin && <p className="text-sm text-muted-foreground">Envoyé. On te répond ici, ouvre Aide pour voir la réponse.</p>}

        <form id="support-form" className="grid gap-2.5" onSubmit={(e) => (e.preventDefault(), void send())}>
          <Label htmlFor="support-message">Ton message</Label>
          <Textarea
            id="support-message"
            value={body}
            onChange={(e) => (setBody(e.target.value), setError(null))}
            placeholder="Ex. Mon employé ne voit pas le cahier."
            maxLength={SUPPORT_MAX_LENGTH}
            className="min-h-20"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "support-error" : undefined}
          />
          {error && (
            <p id="support-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
        {whatsapp && <div className="-mt-2 -ml-4">{whatsapp}</div>}
      </div>
    </ResponsiveSheet>
  );
}
