"use client";

import { useState } from "react";
import { saveSession } from "@/lib/session";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";
import { normalizePhone } from "@/lib/whatsapp";

const input = "w-full rounded-2xl border border-line bg-surface px-4 py-4 text-lg outline-none focus:border-brand";
const primary = "w-full rounded-2xl bg-brand px-4 py-4 text-lg font-semibold text-brand-ink disabled:opacity-50";

// Connexion par numéro + code (SMS ou WhatsApp), sans mot de passe.
// Sans Supabase configuré, on passe en mode "sur cet appareil" : juste un prénom.
export function SignInForm({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");
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
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      const normalized = normalizePhone(phone);
      if (!normalized) throw new Error("Numéro invalide");
      const { error } = await getSupabase()!.auth.signInWithOtp({ phone: `+${normalized}`, options: { channel } });
      if (error) throw new Error(error.message);
      setStep("code");
    });

  const verifyCode = () =>
    run(async () => {
      const { data, error } = await getSupabase()!.auth.verifyOtp({ phone: `+${normalizePhone(phone)}`, token: code.trim(), type: "sms" });
      if (error || !data.user) throw new Error(error?.message ?? "Code incorrect");
      setUserId(data.user.id);
      const savedName = data.user.user_metadata?.display_name as string | undefined;
      if (savedName) await finish(data.user.id, savedName);
      else setStep("name");
    });

  const finish = async (id: string, displayName: string) => {
    if (isCloudConfigured) {
      await getSupabase()!.auth.updateUser({ data: { display_name: displayName } });
    }
    await saveSession({
      userId: id,
      displayName,
      phone: isCloudConfigured ? `+${normalizePhone(phone)}` : null,
      mode: isCloudConfigured ? "cloud" : "local",
    });
    if (isCloudConfigured) await syncNow();
    onDone?.();
  };

  const saveName = () =>
    run(async () => {
      if (!name.trim()) throw new Error("Ton prénom, pour que le patron sache qui a signalé");
      await finish(userId ?? crypto.randomUUID(), name.trim());
    });

  if (!isCloudConfigured || step === "name") {
    return (
      <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), saveName())}>
        <label className="block text-sm font-medium text-muted" htmlFor="name">
          Ton prénom
        </label>
        <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Paul" autoFocus />
        {!isCloudConfigured && (
          <p className="text-sm text-muted">Mode démo : le cahier reste sur ce téléphone tant que Supabase n&apos;est pas branché.</p>
        )}
        {error && <p className="text-sm text-brand">{error}</p>}
        <button className={primary} disabled={busy}>
          Continuer
        </button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), verifyCode())}>
        <p className="text-muted">Code envoyé au {phone} par {channel === "sms" ? "SMS" : "WhatsApp"}.</p>
        <input
          className={`${input} text-center text-2xl tracking-[0.5em]`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
        />
        {error && <p className="text-sm text-brand">{error}</p>}
        <button className={primary} disabled={busy || code.trim().length < 6}>
          Valider
        </button>
        <button type="button" className="w-full py-2 text-muted" onClick={() => setStep("phone")}>
          Changer de numéro
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), sendCode())}>
      <label className="block text-sm font-medium text-muted" htmlFor="phone">
        Ton numéro de téléphone
      </label>
      <input
        id="phone"
        className={input}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="6 99 00 00 00"
        inputMode="tel"
        autoComplete="tel"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2">
        {(["whatsapp", "sms"] as const).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setChannel(c)}
            className={`rounded-2xl border px-3 py-3 font-medium ${channel === c ? "border-brand bg-brand-soft text-brand" : "border-line"}`}
          >
            Code par {c === "sms" ? "SMS" : "WhatsApp"}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-brand">{error}</p>}
      <button className={primary} disabled={busy || !phone.trim()}>
        Recevoir le code
      </button>
    </form>
  );
}
