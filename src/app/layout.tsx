import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

// Lexend : conçue pour faciliter la lecture, y compris pour les lecteurs en difficulté.
const font = Lexend({ subsets: ["latin"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  title: "Yaplus",
  description: "Le cahier de réapprovisionnement partagé de la boutique.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Yaplus", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1424" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={font.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
