import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "Yaplus, le cahier de réapprovisionnement de la boutique",
  description:
    "Tes employés touchent ce qui est fini, tu reçois la liste prête pour le fournisseur sur WhatsApp. Marche sans réseau. Gratuit pendant le lancement.",
  openGraph: {
    title: "Yaplus : Y a plus ? On le note.",
    description: "Le cahier de la boutique, dans le téléphone. Un tap pour signaler, la liste part sur WhatsApp.",
    locale: "fr_CM",
    type: "website",
  },
};

export default function AccueilPage() {
  return <Landing />;
}
