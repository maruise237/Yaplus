import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { LinkList } from "@/components/site/LinkList";
import { Container, H2, Lead, PageTitle } from "@/components/site/Page";
import { SiteCta } from "@/components/site/SiteCta";
import { TemplateNotebook } from "@/components/site/TemplateNotebook";
import { Button } from "@/components/ui/button";
import { findGuide } from "@/content/guides";
import { findModele, MODELES } from "@/content/modeles";
import { findTool } from "@/content/outils";
import { abs, breadcrumb, faqPage, graph, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => MODELES.map((m) => ({ slug: m.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = findModele((await params).slug);
  if (!m) return {};
  return pageMetadata({ title: `${m.title} : modèle gratuit`, description: m.description, ownImage: true, path: `/modeles/${m.slug}` });
}

export default async function ModelePage({ params }: Props) {
  const m = findModele((await params).slug);
  if (!m) notFound();
  const path = `/modeles/${m.slug}`;
  const crumbs: [string, string][] = [["Accueil", "/accueil"], ["Modèles", "/modeles"], [m.label, path]];
  const signup = `/connexion?mode=inscription&modele=${m.slug}`;
  const count = m.categories.reduce((n, c) => n + c.products.length, 0);
  const others = MODELES.filter((o) => o.slug !== m.slug).slice(0, 5);
  const tools = m.related.tools.map(findTool).filter((t) => t !== null);
  const guides = m.related.guides.map(findGuide).filter((g) => g !== null);

  return (
    <>
      <JsonLd
        data={graph(breadcrumb(crumbs), faqPage(m.faq), {
          "@type": "WebPage",
          name: m.title,
          url: abs(path),
          description: m.description,
          about: { "@type": "ItemList", name: `Catégories du modèle ${m.label}`, itemListElement: m.categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name })) },
        })}
      />
      <Container className="pt-6 pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-x-16 lg:gap-y-16">
          <div>
            <PageTitle>{m.title}</PageTitle>
            <Lead>{m.intro}</Lead>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="touch-lg" className="px-6 text-[17px]" asChild>
                <Link href={signup}>Utiliser ce modèle</Link>
              </Button>
              <Button size="touch-lg" variant="outline" className="px-6 text-[17px]" asChild>
                <Link href="/decouvrir">Essayer sans compte</Link>
              </Button>
            </div>
            <p className="mt-4 text-[15px] text-muted-foreground">
              {m.categories.length} catégories et {count} produits, à renommer ou compléter. Gratuit pendant le lancement.
            </p>

          </div>

          <section aria-labelledby="contenu" className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <h2 id="contenu" className="sr-only">
              Catégories et produits du modèle
            </h2>
            <TemplateNotebook label={m.label} categories={m.categories} />
          </section>

          <div className="lg:col-start-1">
            <section aria-labelledby="ideal">
              <H2 id="ideal">Idéal pour</H2>
              <ul className="mt-5 grid max-w-[38rem] gap-3 text-[17px] leading-relaxed">
                {m.idealFor.map((t) => (
                  <li key={t} className="border-t pt-3">
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-16" aria-labelledby="usage">
              <H2 id="usage">Comment l’utiliser</H2>
              <ol className="mt-5 grid max-w-[38rem] gap-5 text-[17px] leading-relaxed">
                {[
                  ["Crée ta boutique avec ce modèle", "Le cahier s’ouvre avec ses catégories et ses produits. Renomme, retire, ajoute ce que tu veux."],
                  ["Invite ton équipe", "Envoie une invitation sur WhatsApp à chaque employé. Il rejoint le cahier avec son numéro."],
                  ["Chacun touche ce qui est fini", "Le produit passe en « à racheter » avec le nom de celui qui l’a signalé. Tu vois tout en direct."],
                  ["Envoie la liste au fournisseur", "Un bouton ouvre WhatsApp avec la liste rangée par catégorie. Coche ce que tu achètes, le reste remonte."],
                ].map(([t, d], i) => (
                  <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-2">
                    <span className="font-semibold text-primary tabular-nums">{i + 1}.</span>
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="text-muted-foreground">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-16" aria-labelledby="conseils">
              <H2 id="conseils">Conseils pour {m.shop}</H2>
              <dl className="mt-5 grid max-w-[38rem]">
                {m.tips.map((t) => (
                  <div key={t.title} className="grid gap-1 border-t py-4">
                    <dt className="text-[17px] font-semibold">{t.title}</dt>
                    <dd className="text-[17px] leading-relaxed text-muted-foreground">{t.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        <div className="max-w-3xl">
          <Faq items={m.faq} />

          <section className="mt-20 grid gap-12 md:grid-cols-2" aria-label="Pour aller plus loin">
            <div>
              <H2 className="text-[1.5rem]">Outils utiles</H2>
              <div className="mt-4">
                <LinkList items={tools.map((t) => ({ href: `/outils/${t.slug}`, title: t.name }))} />
              </div>
            </div>
            <div>
              <H2 className="text-[1.5rem]">À lire</H2>
              <div className="mt-4">
                <LinkList items={guides.map((g) => ({ href: `/guides/${g.slug}`, title: g.title }))} />
              </div>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="autres">
            <H2 id="autres" className="text-[1.5rem]">
              Autres modèles
            </H2>
            <div className="mt-4">
              <LinkList items={[...others.map((o) => ({ href: `/modeles/${o.slug}`, title: o.label })), { href: "/modeles", title: "Tous les modèles" }]} />
            </div>
          </section>
        </div>
      </Container>
      <SiteCta title={`Ton cahier ${m.label.toLowerCase()} est prêt.`} text="Crée ta boutique avec ce modèle en une minute, puis invite ton équipe sur WhatsApp." href={signup} label="Utiliser ce modèle" />
    </>
  );
}
