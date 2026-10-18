"use client";

import { ArrowLeft, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogoMark, Wordmark } from "@/components/AppShell";
import { BrandBackdrop } from "@/components/onboarding/BrandBackdrop";
import { TryItDemo } from "@/components/onboarding/TryItDemo";
import { Button } from "@/components/ui/button";
import { getMeta, setMeta } from "@/lib/db";
import { base } from "@/lib/motion";
import { findGoal, GOALS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const STEPS = 3;

// Découverte en trois écrans, avant tout compte : montrer le geste, demander ce qui compte,
// dire ce qui change. Chaque étape est dans l'URL pour que le bouton retour d'Android marche.
function Discover() {
  const router = useRouter();
  const params = useSearchParams();
  const step = Math.min(Math.max(Number(params.get("etape")) || 1, 1), STEPS);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [missingChoice, setMissingChoice] = useState(false);

  useEffect(() => {
    void getMeta<string>("onboardingGoal").then((g) => g && setGoalId(g));
  }, []);

  const go = (n: number) => router.push(n === 1 ? "/decouvrir" : `/decouvrir?etape=${n}`, { scroll: true });

  const choose = (id: string) => {
    setGoalId(id);
    setMissingChoice(false);
    void setMeta("onboardingGoal", id);
  };

  let content: React.ReactNode;
  let footer: React.ReactNode;

  if (step === 1) {
    content = (
      <>
        <h1 className="text-[2.125rem] leading-[1.1] font-semibold tracking-tight text-balance">Y a plus ? On le note.</h1>
        <p className="mt-3 max-w-[34ch] text-[17px] leading-relaxed text-muted-foreground">
          Tes employés touchent ce qui est fini. Toi, tu reçois la liste prête à envoyer au fournisseur.
        </p>
        <div className="mt-7">
          <TryItDemo />
        </div>
      </>
    );
    footer = (
      <>
        <Button size="touch-lg" className="w-full" onClick={() => go(2)}>
          Commencer
        </Button>
        <div className="flex justify-between gap-3 pt-1 text-[15px]">
          <Link href="/connexion" className="flex h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
            J’ai déjà un compte
          </Link>
          <Link href="/rejoindre" className="flex h-11 items-center text-muted-foreground underline-offset-4 hover:underline">
            J’ai un code d’invitation
          </Link>
        </div>
      </>
    );
  } else if (step === 2) {
    content = (
      <>
        <h1 className="text-[1.875rem] leading-[1.15] font-semibold tracking-tight text-balance">Qu’est-ce qui t’aiderait le plus ?</h1>
        <p className="mt-2 text-[17px] text-muted-foreground">Un seul choix, pour préparer ta boutique.</p>
        <div role="radiogroup" aria-label="Ce qui t’aiderait le plus" className="mt-6 divide-y overflow-hidden rounded-xl border bg-card">
          {GOALS.map((g) => {
            const selected = goalId === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(g.id)}
                className={cn(
                  "flex min-h-16 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  selected ? "bg-primary/[0.06]" : "hover:bg-accent/50",
                )}
              >
                <Icon className={cn("size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} aria-hidden />
                <span className="min-w-0 flex-1 text-[17px] leading-snug font-medium">{g.label}</span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-150",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
                  )}
                  aria-hidden
                >
                  {selected && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
        {missingChoice && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            Choisis une réponse, ou passe cette étape.
          </p>
        )}
      </>
    );
    footer = (
      <>
        <Button size="touch-lg" className="w-full" onClick={() => (goalId ? go(3) : setMissingChoice(true))}>
          Continuer
        </Button>
        <Button variant="ghost" size="touch" className="w-full text-muted-foreground" onClick={() => go(3)}>
          Passer
        </Button>
      </>
    );
  } else {
    const goal = findGoal(goalId);
    const shown = goal ? [goal] : GOALS.slice(0, 3);
    content = (
      <>
        <h1 className="text-[1.875rem] leading-[1.15] font-semibold tracking-tight text-balance">Voilà ce qui change pour toi</h1>
        <ul className="mt-6 grid gap-3">
          {shown.map((g) => {
            const Icon = g.icon;
            return (
              <li key={g.id} className="flex gap-4 rounded-xl border bg-card p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary" aria-hidden>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] leading-relaxed text-muted-foreground">{g.before}</span>
                  <span className="mt-1.5 block text-[18px] leading-snug font-medium">{g.after}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
          Pour commencer : ton prénom, puis le nom de ta boutique. Moins d’une minute.
        </p>
      </>
    );
    footer = (
      <>
        <Button size="touch-lg" className="w-full" onClick={() => router.push("/connexion")}>
          Créer ma boutique
        </Button>
        <Button variant="ghost" size="touch" className="w-full text-muted-foreground" asChild>
          <Link href="/rejoindre">J’ai un code d’invitation</Link>
        </Button>
      </>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <BrandBackdrop />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] md:min-h-0 md:pt-[8vh]">
        <header className="flex h-14 shrink-0 items-center gap-3">
          {step === 1 ? (
            <Wordmark />
          ) : (
            <>
              <LogoMark />
              <Button variant="ghost" size="icon-touch" className="-ml-1" onClick={() => go(step - 1)} aria-label="Étape précédente">
                <ArrowLeft />
              </Button>
              <div
                className="ml-1 h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-label="Progression"
                aria-valuemin={1}
                aria-valuemax={STEPS}
                aria-valuenow={step}
              >
                <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: `${(step / STEPS) * 100}%` }} transition={base} />
              </div>
            </>
          )}
        </header>

        <main className="flex-1 pt-6 pb-6 md:flex-none md:pt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0, transition: base }}
              exit={{ opacity: 0, x: -12, transition: { duration: 0.12 } }}
            >
              {content}
            </motion.section>
          </AnimatePresence>
        </main>

        <footer className="sticky bottom-0 -mx-5 grid gap-1 border-t bg-background/92 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-12 md:backdrop-blur-none">
          {footer}
        </footer>
      </div>
    </div>
  );
}

export default function DecouvrirPage() {
  return (
    <Suspense>
      <Discover />
    </Suspense>
  );
}
