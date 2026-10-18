"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSession } from "@/lib/session";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";
import { cn } from "@/lib/utils";
import { normalizePhone } from "@/lib/whatsapp";

// Connexion par numéro + code (SMS ou WhatsApp), sans mot de passe.
// Sans serveur configuré : mode « sur cet appareil », on demande juste un prénom.
export function SignInForm({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  const finish = async (id: string, displayName: string) => {
    if (isCloudConfigured) await getSupabase()!.auth.updateUser({ data: { display_name: displayName } });
    await saveSession({
      userId: id,
      displayName,
      phone: isCloudConfigured ? `+${normalizePhone(phone)}` : null,
      mode: isCloudConfigured ? "cloud" : "local",
    });
    if (isCloudConfigured) await syncNow();
    onDone?.();
  };

  const sendCode = () =>
    run(async () => {
      const normalized = normalizePhone(phone);
      if (!normalized) throw new Error("Ce numéro ne semble pas valide. Exemple : 6 99 00 11 22");
      const { error } = await getSupabase()!.auth.signInWithOtp({ phone: `+${normalized}`, options: { channel } });
      if (error) throw new Error("Le code n’a pas pu être envoyé. Vérifie le numéro et réessaie.");
      setStep("code");
    });

  const verifyCode = () =>
    run(async () => {
      const { data, error } = await getSupabase()!.auth.verifyOtp({ phone: `+${normalizePhone(phone)}`, token: code.trim(), type: "sms" });
      if (error || !data.user) throw new Error("Code incorrect ou expiré.");
      setUserId(data.user.id);
      const savedName = data.user.user_metadata?.display_name as string | undefined;
      if (savedName) await finish(data.user.id, savedName);
      else setStep("name");
    });

  const saveName = () =>
    run(async () => {
      if (!name.trim()) throw new Error("Écris ton prénom : l’équipe verra qui a signalé quoi.");
      await finish(userId ?? crypto.randomUUID(), name.trim());
    });

  const errorText = error && (
    <p className="text-sm text-destructive" role="alert">
      {error}
    </p>
  );

  if (!isCloudConfigured || step === "name") {
    return (
      <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), saveName())}>
        <div className="grid gap-2.5">
          <Label htmlFor="name">Ton prénom</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Paul" autoComplete="given-name" aria-invalid={Boolean(error)} />
          {errorText}
        </div>
        <Button type="submit" size="touch-lg" disabled={busy}>
          Continuer
        </Button>
        {!isCloudConfigured && (
          <p className="text-sm text-muted-foreground">Mode démo : le cahier reste sur ce téléphone, rien n’est envoyé.</p>
        )}
      </form>
    );
  }

  if (step === "code") {
    return (
      <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), verifyCode())}>
        <div className="grid gap-2.5">
          <Label htmlFor="otp">Code reçu par {channel === "sms" ? "SMS" : "WhatsApp"}</Label>
          <Input
            id="otp"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="h-14 text-center text-2xl tracking-[0.4em] tabular-nums"
            aria-invalid={Boolean(error)}
          />
          {errorText}
        </div>
        <Button type="submit" size="touch-lg" disabled={busy}>
          {busy ? "Vérification…" : "Valider"}
        </Button>
        <Button type="button" variant="ghost" size="touch" className="text-muted-foreground" onClick={() => setStep("phone")}>
          Changer de numéro
        </Button>
      </form>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), sendCode())}>
      <div className="grid gap-2.5">
        <Label htmlFor="phone">Ton numéro de téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="6 99 00 11 22"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(error)}
        />
        {errorText}
      </div>
      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-medium">Recevoir le code par</legend>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
          {(["whatsapp", "sms"] as const).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setChannel(c)}
              aria-pressed={channel === c}
              className={cn(
                "h-10 rounded-md text-[15px] font-medium transition-[background-color,color,box-shadow] duration-150",
                channel === c ? "bg-card text-foreground shadow-xs" : "text-muted-foreground",
              )}
            >
              {c === "sms" ? "SMS" : "WhatsApp"}
            </button>
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="touch-lg" disabled={busy}>
        {busy ? "Envoi…" : "Recevoir le code"}
      </Button>
    </form>
  );
}
