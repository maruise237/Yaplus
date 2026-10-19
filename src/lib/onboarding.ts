import type { LucideIcon } from "lucide-react";
import { ClipboardList, Eye, Store, Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

// Ce que le patron attend en priorité ; la réponse choisit le « avant / après » montré ensuite.
export type Goal = {
  id: string;
  icon: LucideIcon | typeof WhatsAppIcon;
  label: string;
  before: string;
  after: string;
};

export const GOALS: Goal[] = [
  {
    id: "oublis",
    icon: ClipboardList,
    label: "Ne plus oublier ce qui manque",
    before: "On remarque une rupture, puis on oublie de la noter.",
    after: "Un tap sur le produit et c’est noté. Ce qui n’est pas acheté revient en haut de la liste suivante.",
  },
  {
    id: "distance",
    icon: Eye,
    label: "Savoir ce qui manque sans être à la boutique",
    before: "J’appelle la boutique pour savoir ce qu’il faut acheter.",
    after: "Tu vois la liste à jour depuis ton téléphone, avec le nom de l’employé qui a signalé.",
  },
  {
    id: "whatsapp",
    icon: WhatsAppIcon,
    label: "Envoyer la liste au fournisseur plus vite",
    before: "Je recopie la liste à la main avant de l’envoyer sur WhatsApp.",
    after: "Un bouton ouvre WhatsApp avec la liste prête, rangée par catégorie.",
  },
  {
    id: "equipe",
    icon: Users,
    label: "Une seule liste pour toute l’équipe",
    before: "Chaque employé note sur sa page, et il faut tout rassembler.",
    after: "Tout le monde remplit le même cahier, même sans réseau. Rien ne se perd.",
  },
  {
    id: "boutiques",
    icon: Store,
    label: "Suivre plusieurs boutiques",
    before: "Je passe d’une boutique à l’autre pour faire les listes.",
    after: "Tu vois ce qui manque dans chaque boutique, au même endroit, en direct.",
  },
];

export const findGoal = (id: string | null) => GOALS.find((g) => g.id === id) ?? null;
