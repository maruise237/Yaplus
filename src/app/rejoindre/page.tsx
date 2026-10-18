"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Wordmark } from "@/components/AppShell";
import { SignInForm } from "@/components/SignInForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(code);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de rejoindre la boutique.");
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  if (!isCloudConfigured) {
    body = <p className="text-[15px] text-muted-foreground">Les invitations fonctionnent une fois le serveur branché.</p>;
  } else if (session === undefined) {
    body = null;
  } else if (session === null) {
    body = <SignInForm />;
  } else {
    body = (
      <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), submit())}>
        <div className="grid gap-2.5">
          <Label htmlFor="invite-code">Code d’invitation</Label>
          <Input
            id="invite-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="Ex. K7P2QX"
            maxLength={6}
            autoComplete="off"
            spellCheck={false}
            className="h-14 text-center text-2xl font-semibold tracking-[0.3em] uppercase"
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" size="touch-lg" disabled={busy}>
          {busy ? "Connexion à la boutique…" : "Rejoindre"}
        </Button>
      </form>
    );
  }

  return (
    <div className="grid gap-8">
      <Wordmark />
      <div>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">Rejoindre une boutique</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {session ? "Entre le code envoyé par ton patron." : "Connecte-toi avec ton numéro, puis entre le code reçu."}
        </p>
      </div>
      {body}
    </div>
  );
}

export default function RejoindrePage() {
  return (
    <Suspense>
      <Join />
    </Suspense>
  );
}
