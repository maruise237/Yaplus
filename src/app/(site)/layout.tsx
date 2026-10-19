import { NotebookLines, NotebookMargin } from "@/components/site/NotebookLines";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Pages publiques (modèles, comparatifs, outils, guides) : rendues sur le serveur, sans l'app.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <div className="relative">
        <NotebookLines className="h-[40rem]" />
        <NotebookMargin />
        <SiteHeader />
        <main>{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
