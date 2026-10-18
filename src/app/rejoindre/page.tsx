"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SignInForm } from "@/components/SignInForm";
import { useSession } from "@/lib/hooks";
import { acceptInvite } from "@/lib/invites";
import { isCloudConfigured } from "@/lib/supabase";

function Join() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useSession();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCloudConfigured) {
    return <p className="text-muted">Les invitations seront disponibles une fois le serveur Supabase branché.</p>;
  }
  if (session === undefined) return null;
  if (session === null) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black">Rejoindre la boutique</h1>
        <p className="text-muted">Connecte-toi avec ton numéro, puis tu arrives directement dans le cahier.</p>
        <SignInForm />
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(code);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), submit())}>
      <h1 className="text-3xl font-black">Rejoindre la boutique</h1>
      <input
        className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-center text-2xl font-bold uppercase tracking-[0.3em] outline-none focus:border-brand"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="CODE"
        maxLength={6}
      />
      {error && <p className="text-sm text-brand">{error}</p>}
      <button className="w-full rounded-2xl bg-brand px-4 py-4 text-lg font-semibold text-brand-ink disabled:opacity-50" disabled={busy || code.length < 6}>
        Rejoindre
      </button>
    </form>
  );
}

export default function RejoindrePage() {
  return (
    <Suspense>
      <Join />
    </Suspense>
  );
}
