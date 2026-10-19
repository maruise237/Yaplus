"use client";

import { Eye, EyeOff } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthError, checkResetLink, DEAD_LINK, MIN_PASSWORD_LENGTH, resetWithLink } from "@/lib/auth";
import { useSupportWhatsapp } from "@/hooks/use-support-whatsapp";
import { forgotPasswordLink } from "@/lib/support";

type State = { step: "checking" } | { step: "form"; name: string; phone: string } | { step: "dead" } | { step: "error"; message: string };

// Ouvert depuis le lien envoyé par le support sur WhatsApp. Le jeton est après le « # » :
// il ne part dans aucune requête de page, et on l'efface de la barre d'adresse.
export default function NewPasswordPage() {
  const router = useRouter();
  const token = useRef("");
  const [state, setState] = useState<State>({ step: "checking" });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    setState({ step: "checking" });
    try {
      const user = await checkResetLink(token.current);
      setState({ step: "form", name: user.displayName, phone: user.phone });
    } catch (e) {
      setState(e === DEAD_LINK || !(e instanceof AuthError) ? { step: "dead" } : { step: "error", message: e.message });
    }
  };

  useEffect(() => {
    if (token.current) return;
    token.current = window.location.hash.slice(1);
    window.history.replaceState(null, "", window.location.pathname);
    void check();
  }, []);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await resetWithLink(token.current, password);
      router.replace("/");
    } catch (e) {
      if (e === DEAD_LINK) setState({ step: "dead" });
      else setError(e instanceof AuthError ? e.message : "Une erreur est survenue. Réessaie.");
      setBusy(false);
    }
  };

  const support = forgotPasswordLink(useSupportWhatsapp(), "");

  return (
    <div className="grid gap-8">
      <Wordmark />

      {state.step === "checking" && (
        <div className="grid gap-3" aria-busy="true" aria-label="Vérification du lien">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
      )}

      {state.step === "error" && (
        <div className="grid gap-5">
          <div>
            <h1 className="text-[1.875rem] leading-tight font-semibold tracking-tight">Nouveau mot de passe</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground" role="alert">
              {state.message}
            </p>
          </div>
          <Button size="touch-lg" onClick={() => void check()}>
            Réessayer
          </Button>
        </div>
      )}

      {state.step === "dead" && (
        <div className="grid gap-5">
          <div>
            <h1 className="text-[1.875rem] leading-tight font-semibold tracking-tight">Ce lien ne marche plus</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Il a déjà servi, a été annulé ou a plus de 24 heures. Demande un nouveau lien au support.
            </p>
          </div>
          <div className="grid gap-2">
            {support && (
              <Button size="touch-lg" asChild>
                <a href={support} target="_blank" rel="noreferrer">
                  <WhatsAppIcon aria-hidden />
                  Écrire au support
                </a>
              </Button>
            )}
            <Button variant="ghost" size="touch" className="text-primary" asChild>
              <Link href="/connexion">Se connecter</Link>
            </Button>
          </div>
        </div>
      )}

      {state.step === "form" && (
        <>
          <div>
            <h1 className="text-[1.875rem] leading-tight font-semibold tracking-tight">Nouveau mot de passe</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Pour le compte de {state.name}, <span className="tabular-nums whitespace-nowrap">{state.phone}</span>.
            </p>
          </div>
          <form className="grid gap-5" onSubmit={(e) => (e.preventDefault(), void submit())} noValidate>
            <div className="grid gap-2.5">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => (setPassword(e.target.value), setError(null))}
                  autoComplete="new-password"
                  spellCheck={false}
                  className="pr-12"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "new-password-error" : "new-password-hint"}
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
              {error ? (
                <p id="new-password-error" className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : (
                <p id="new-password-hint" className="text-sm text-muted-foreground">
                  {MIN_PASSWORD_LENGTH} caractères minimum. Des chiffres suffisent, garde-le pour toi.
                </p>
              )}
            </div>
            <Button type="submit" size="touch-lg" disabled={busy}>
              {busy ? "Enregistrement…" : "Enregistrer et me connecter"}
            </Button>
            <p className="text-sm text-muted-foreground">Ce lien marche une seule fois.</p>
          </form>
        </>
      )}
    </div>
  );
}
