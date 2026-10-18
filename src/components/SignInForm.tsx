"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthError, type AuthField, MIN_PASSWORD_LENGTH, signIn, signUp } from "@/lib/auth";
import { isCloudConfigured } from "@/lib/cloud";

export type AuthMode = "inscription" | "connexion";

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {children}
    </p>
  );
}

// Numéro + mot de passe, sans code à attendre : rien n'est envoyé par SMS ou WhatsApp.
export function SignInForm({
  mode,
  onModeChange,
  onDone,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onDone?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field: AuthField | null } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const signingUp = mode === "inscription";

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (signingUp) await signUp({ name, phone, password });
      else await signIn({ phone, password });
      onDone?.();
    } catch (e) {
      const err = e instanceof AuthError ? e : new AuthError("Une erreur est survenue. Réessaie.");
      setError({ message: err.message, field: err.field });
      if (err.field) ({ name: nameRef, phone: phoneRef, password: passwordRef })[err.field].current?.focus();
      setBusy(false);
    }
  };

  // L'erreur disparaît dès qu'on corrige le champ concerné.
  const edit = (field: AuthField, set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value);
    if (error && (error.field === field || error.field === null)) setError(null);
  };

  const errorFor = (field: AuthField) => (error?.field === field ? error.message : null);
  const describedBy = (field: AuthField, hint?: string) => [errorFor(field) ? `${field}-error` : null, hint].filter(Boolean).join(" ") || undefined;

  return (
    <form className="grid gap-5" onSubmit={(e) => (e.preventDefault(), void submit())} noValidate>
      {signingUp && (
        <div className="grid gap-2.5">
          <Label htmlFor="name">Ton prénom</Label>
          <Input
            ref={nameRef}
            id="name"
            name="given-name"
            value={name}
            onChange={edit("name", setName)}
            placeholder="Ex. Paul"
            autoComplete="given-name"
            aria-invalid={Boolean(errorFor("name"))}
            aria-describedby={describedBy("name")}
          />
          {errorFor("name") && <FieldError id="name-error">{errorFor("name")}</FieldError>}
        </div>
      )}

      <div className="grid gap-2.5">
        <Label htmlFor="phone">Ton numéro de téléphone</Label>
        <Input
          ref={phoneRef}
          id="phone"
          name="tel"
          type="tel"
          value={phone}
          onChange={edit("phone", setPhone)}
          placeholder="6 99 00 11 22"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errorFor("phone"))}
          aria-describedby={describedBy("phone")}
        />
        {errorFor("phone") && <FieldError id="phone-error">{errorFor("phone")}</FieldError>}
      </div>

      <div className="grid gap-2.5">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={edit("password", setPassword)}
            autoComplete={signingUp ? "new-password" : "current-password"}
            spellCheck={false}
            className="pr-12"
            aria-invalid={Boolean(errorFor("password"))}
            aria-describedby={describedBy("password", signingUp ? "password-hint" : undefined)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-0 right-0 grid size-11 place-items-center rounded-lg text-muted-foreground"
            aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
        {errorFor("password") ? (
          <FieldError id="password-error">{errorFor("password")}</FieldError>
        ) : (
          signingUp && (
            <p id="password-hint" className="text-sm text-muted-foreground">
              {MIN_PASSWORD_LENGTH} caractères minimum. Des chiffres suffisent, garde-le pour toi.
            </p>
          )
        )}
      </div>

      {error && !error.field && <FieldError id="form-error">{error.message}</FieldError>}

      <Button type="submit" size="touch-lg" disabled={busy}>
        {busy ? (signingUp ? "Création du compte…" : "Connexion…") : signingUp ? "Créer mon compte" : "Se connecter"}
      </Button>

      <p className="text-center text-[15px] text-muted-foreground">
        {signingUp ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <button
          type="button"
          onClick={() => {
            onModeChange(signingUp ? "connexion" : "inscription");
            setError(null);
          }}
          className="inline-flex h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
        >
          {signingUp ? "Se connecter" : "Créer un compte"}
        </button>
      </p>

      {!isCloudConfigured && (
        <p className="text-sm text-muted-foreground">Mode démo : le compte et le cahier restent sur ce téléphone, rien n’est envoyé.</p>
      )}
    </form>
  );
}
