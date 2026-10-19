"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark, Wordmark } from "@/components/AppShell";
import { StatusMark } from "@/components/ProductRow";
import { Button } from "@/components/ui/button";
import { base, quick } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NotebookLines, NotebookMargin } from "@/components/site/NotebookLines";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FAQ } from "./faq";
import { OfflineDemo } from "./OfflineDemo";
import { PaperNote } from "./PaperNote";
import { PhoneDemo } from "./PhoneDemo";

const SIGNUP = "/connexion?mode=inscription";

// Page d'accueil publique. Le décor est le cahier qu'on remplace : lignes Seyès en haut,
// et la marge rouge qui court le long de la page, comme dans les listes de l'app.
export function Landing() {
  const hero = useRef<HTMLElement>(null);
  const finalCta = useRef<HTMLElement>(null);
  const heroVisible = useInView(hero, { initial: true });
  const finalVisible = useInView(finalCta);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <div className="relative">
        <NotebookLines />
        <NotebookMargin />

        <header
          className={cn(
            "z-40 transition-[background-color,border-color] duration-200 md:sticky md:top-0",
            scrolled ? "border-b bg-background/85 backdrop-blur-md" : "border-b border-transparent",
          )}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 pr-4 pl-7 sm:pr-8 sm:pl-11">
            <Link href="/accueil" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Yaplus, accueil">
              <Wordmark />
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              {[
                ["Modèles", "/modeles"],
                ["Outils", "/outils"],
                ["Guides", "/guides"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="hidden h-11 items-center rounded-lg px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:flex"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/connexion"
                className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Se connecter
              </Link>
              <Button size="touch" className="hidden sm:inline-flex" asChild>
                <Link href={SIGNUP}>Créer ma boutique</Link>
              </Button>
            </nav>
          </div>
        </header>

        {/* Ouverture */}
        <section ref={hero} className="relative">
          <div className="relative mx-auto grid max-w-6xl gap-20 pt-6 pr-4 pb-20 pl-7 sm:pr-8 sm:pl-11 md:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10 lg:pt-8 lg:pb-28 xl:gap-16">
            <div className="max-w-xl">
              <h1 className="text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.98] font-semibold tracking-[-0.04em] lg:text-[clamp(3.6rem,6.4vw,5.4rem)]">
                <span className="block">Y a plus&#8239;?</span>
                <span className="block">On le note.</span>
              </h1>
              <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px] md:mt-7">
                Le cahier de la boutique, dans le téléphone. Tes employés touchent ce qui est fini. Toi, tu reçois la liste prête pour le fournisseur.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-9">
                <Button size="touch-lg" className="px-6 text-[17px]" asChild>
                  <Link href={SIGNUP}>Créer ma boutique</Link>
                </Button>
                <Button size="touch-lg" variant="outline" className="px-6 text-[17px]" asChild>
                  <Link href="/rejoindre">J’ai un code d’invitation</Link>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-muted-foreground">
                {["Gratuit pendant le lancement", "Marche sans réseau", "Prêt en une minute"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-success" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:px-24 xl:px-28">
              <PhoneDemo />
            </div>
          </div>
        </section>

        {/* Le papier qu'on remplace */}
        <section className="mx-auto max-w-6xl pt-8 pr-4 pb-24 pl-7 sm:pr-8 sm:pl-11 md:pb-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="relative order-2 mx-auto w-full max-w-[24rem] pb-6 lg:order-1">
              <PaperNote className="w-[78%] -rotate-[5deg] drop-shadow-[0_10px_18px_rgb(16_40_80/0.16)]" />
              <div className="absolute right-0 -bottom-6 w-[68%] rotate-[2deg] overflow-hidden rounded-2xl border bg-card shadow-[0_18px_40px_-18px_rgb(16_40_80/0.35),0_2px_6px_-2px_rgb(16_40_80/0.12)]">
                <p className="flex items-center gap-1.5 border-b px-3.5 py-2.5 text-[13px] font-semibold">
                  <LogoMark className="size-4" />À racheter
                </p>
                <ul className="divide-y">
                  {[
                    ["KG5", "Paul"],
                    ["Pochette Itel A100", "Marie"],
                    ["Chargeur Type-C 18 W", "Paul"],
                  ].map(([n, by]) => (
                    <li key={n} className="flex min-h-12 items-center gap-2.5 bg-flag-subtle px-3.5 py-1.5">
                      <StatusMark status="to_buy" />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium">{n}</span>
                        <span className="block text-[12px] text-flag-text">Signalé par {by}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="max-w-[16ch] text-[clamp(2.1rem,7vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
                Fini les feuilles qu’on prend en photo.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground">
                Chacun écrivait sur sa page, on photographiait les feuilles, puis on recopiait tout le soir. Maintenant il y a une seule liste, propre, que toute
                l’équipe remplit.
              </p>
              <dl className="mt-8 grid max-w-lg">
                {[
                  ["Un tap suffit", "Toucher le produit fini prend moins de 5 secondes. Aucune quantité à taper."],
                  ["Tu sais qui a signalé", "Chaque produit garde le nom de l’employé qui l’a signalé."],
                  ["Rien n’est oublié", "Ce qui n’a pas été acheté remonte en haut de la liste suivante."],
                ].map(([t, d]) => (
                  <div key={t} className="grid gap-1 border-t py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="font-semibold">{t}</dt>
                    <dd className="text-muted-foreground">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Deux rôles, deux gestes */}
        <section className="border-y bg-card/60">
          <div className="mx-auto max-w-6xl py-20 pr-4 pl-7 sm:pr-8 sm:pl-11 md:py-28">
            <h2 className="max-w-[18ch] text-[clamp(2.1rem,7vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
              Chacun son geste, un seul cahier.
            </h2>
            <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x">
              <Role
                who="Ton employé"
                lines={[
                  "Il ouvre sa catégorie et touche le produit fini.",
                  "Pas de phrase à écrire : s’il cherche un produit, l’app propose ceux qui existent.",
                  "Il ajoute un produit nouveau sur place, en tapant son nom.",
                ]}
                className="md:pr-12"
              />
              <Role
                who="Toi, le patron"
                lines={[
                  "Tu vois ce qui manque en direct, même loin de la boutique.",
                  "Un bouton envoie la liste au fournisseur sur WhatsApp, rangée par catégorie.",
                  "Tu suis toutes tes boutiques au même endroit.",
                ]}
                className="md:pl-12"
              />
            </div>
          </div>
        </section>

        {/* Hors ligne */}
        <section className="mx-auto max-w-6xl py-24 pr-4 pl-7 sm:pr-8 sm:pl-11 md:py-32">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-20">
            <div>
              <h2 className="max-w-[15ch] text-[clamp(2.1rem,7vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
                Pas de réseau&#8239;? Ça marche quand même.
              </h2>
              <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-muted-foreground">
                Le cahier s’ouvre et se remplit sans connexion. Chaque signalement attend dans le téléphone et part tout seul dès que le réseau revient. Rien
                ne se perd, rien n’est écrasé.
              </p>
            </div>
            <OfflineDemo />
          </div>
        </section>

        {/* Questions */}
        <section className="mx-auto max-w-6xl pr-4 pb-24 pl-7 sm:pr-8 sm:pl-11 md:pb-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,40rem)] lg:gap-20">
            <h2 className="max-w-[12ch] text-[clamp(2.1rem,7vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">Tes questions</h2>
            <div className="border-t">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group border-b">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="max-w-[60ch] pb-5 text-[16px] leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Dernier appel */}
      <section ref={finalCta} className="relative overflow-hidden bg-[#0a6cc8] text-white">
        <svg viewBox="2 2 96 96" className="pointer-events-none absolute -right-16 -bottom-24 w-[22rem] text-white opacity-[0.09] md:right-[6%] md:-bottom-16 md:w-[28rem]" aria-hidden>
          <path fill="currentColor" d="M6 6H31L64 58.25V96H40V59.8ZM66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z" />
        </svg>
        <div className="relative mx-auto max-w-6xl py-20 pr-4 pl-7 sm:pr-8 sm:pl-11 md:py-28">
          <h2 className="max-w-[14ch] text-[clamp(2.3rem,8vw,4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            Ton cahier est prêt en une minute.
          </h2>
          <p className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-white">
            Ton prénom, ton numéro et un mot de passe, puis le nom de la boutique. Ensuite tu invites tes employés par WhatsApp.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="touch-lg" className="bg-white px-6 text-[17px] text-[#0a5aa8] hover:bg-white/90 focus-visible:ring-white/60" asChild>
              <Link href={SIGNUP}>Créer ma boutique</Link>
            </Button>
            <Link
              href="/connexion"
              className="flex h-12 items-center rounded-lg px-2 text-[16px] font-medium text-white underline decoration-white/40 underline-offset-4 outline-none hover:decoration-white focus-visible:ring-2 focus-visible:ring-white/60 sm:px-4"
            >
              J’ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0" />

      {/* Téléphone : l'action reste à portée de pouce une fois l'ouverture et la démo passées */}
      <AnimatePresence>
        {!heroVisible && !finalVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: base }}
            exit={{ y: "100%", transition: quick }}
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/92 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden"
          >
            <Button size="touch-lg" className="w-full text-[17px]" asChild>
              <Link href={SIGNUP}>Créer ma boutique</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Role({ who, lines, className }: { who: string; lines: string[]; className?: string }) {
  return (
    <div className={className}>
      <h3 className="text-[22px] font-semibold tracking-tight">{who}</h3>
      <ul className="mt-5 grid gap-4">
        {lines.map((l) => (
          <li key={l} className="flex gap-3 text-[17px] leading-relaxed">
            <Check className="mt-1 size-[18px] shrink-0 text-primary" aria-hidden />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
