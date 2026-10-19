"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Wordmark } from "@/components/AppShell";
import { type AuthMode, SignInForm } from "@/components/SignInForm";
import { findSiteTemplate } from "@/content/shop-templates";
import { setMeta } from "@/lib/db";

function Connexion() {
  const router = useRouter();
  const params = useSearchParams();
  const mode: AuthMode = params.get("mode") === "inscription" ? "inscription" : "connexion";

  // Venu d'une page /modeles : le modèle sera proposé à la création de la boutique.
  const modele = params.get("modele");
  useEffect(() => {
    if (findSiteTemplate(modele)) void setMeta("shopTemplate", modele);
  }, [modele]);

  return (
    <div className="grid gap-8">
      <Wordmark />
      <div>
        <h1 className="text-[1.875rem] leading-tight font-semibold tracking-tight">{mode === "inscription" ? "Crée ton compte" : "Se connecter"}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {mode === "inscription"
            ? "Ton numéro et un mot de passe. Pas de code à attendre."
            : "Avec le numéro et le mot de passe choisis à l’inscription."}
        </p>
      </div>
      <SignInForm mode={mode} onModeChange={(m) => router.replace(m === "inscription" ? "/connexion?mode=inscription" : "/connexion")} />
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <Connexion />
    </Suspense>
  );
}
