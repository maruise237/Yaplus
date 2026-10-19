import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dernier appel, en bas de chaque page publique : le même bleu que l'accueil.
export function SiteCta({ title, text, href = "/connexion?mode=inscription", label = "Créer ma boutique" }: { title: string; text: string; href?: string; label?: string }) {
  return (
    <section className="relative overflow-hidden bg-[#0a6cc8] text-white">
      <svg viewBox="2 2 96 96" className="pointer-events-none absolute -right-16 -bottom-24 w-[20rem] text-white opacity-[0.09] md:right-[6%] md:-bottom-16 md:w-[24rem]" aria-hidden>
        <path fill="currentColor" d="M6 6H31L64 58.25V96H40V59.8ZM66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z" />
      </svg>
      <div className="relative mx-auto max-w-6xl py-16 pr-4 pl-7 sm:pr-8 sm:pl-11 md:py-24">
        <h2 className="max-w-[18ch] text-[clamp(2rem,6.5vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">{title}</h2>
        <p className="mt-4 max-w-[42ch] text-[17px] leading-relaxed text-white">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="touch-lg" className="bg-white px-6 text-[17px] text-[#0a5aa8] hover:bg-white/90 focus-visible:ring-white/60" asChild>
            <Link href={href}>{label}</Link>
          </Button>
          <Link
            href="/decouvrir"
            className="flex h-12 items-center rounded-lg px-2 text-[16px] font-medium text-white underline decoration-white/40 underline-offset-4 outline-none hover:decoration-white focus-visible:ring-2 focus-visible:ring-white/60 sm:px-4"
          >
            Essayer sans compte
          </Link>
        </div>
      </div>
    </section>
  );
}
