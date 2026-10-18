"use client";

import { useActionState } from "react";
import { Wordmark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdmin, type SignInState } from "./actions";

export function AdminSignIn() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAdmin, { error: null });
  return (
    <>
      <Wordmark />
      <h1 className="mt-8 text-[1.625rem] leading-tight font-bold tracking-tight">Accès admin</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">Ton compte Yaplus, puis le code de ton appli d’authentification.</p>
      <form action={action} className="mt-7 grid gap-5" aria-describedby={state.error ? "admin-error" : undefined}>
        <div className="grid gap-2.5">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" spellCheck={false} required />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="code">Code à 6 chiffres</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            className="tracking-[0.2em] tabular-nums"
            required
          />
        </div>
        {state.error && (
          <p id="admin-error" className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" size="touch-lg" disabled={pending}>
          {pending ? "Vérification…" : "Entrer"}
        </Button>
      </form>
    </>
  );
}
