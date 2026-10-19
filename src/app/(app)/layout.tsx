import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

// L'app (cahier, listes, connexion) reste hors des moteurs ; seul l'accueil y est, et le dit lui-même.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
