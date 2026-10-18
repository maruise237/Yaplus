"use client";

import { Wordmark } from "@/components/AppShell";
import { SignInForm } from "@/components/SignInForm";

export default function ConnexionPage() {
  return (
    <div className="grid gap-8">
      <Wordmark />
      <div>
        <h1 className="text-[1.875rem] leading-tight font-semibold tracking-tight">Y a plus ? On le note.</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Chaque employé signale ce qui manque en un geste. Le patron voit la liste en direct, même sans connexion, puis l’envoie sur WhatsApp.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
