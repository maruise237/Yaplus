"use client";

import { Wordmark } from "@/components/AppShell";
import { SignInForm } from "@/components/SignInForm";

export default function ConnexionPage() {
  return (
    <div className="grid gap-8">
      <Wordmark />
      <div>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">Le cahier de la boutique</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Quand un produit est fini, touche-le. Le patron voit la liste à jour, même à distance.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
