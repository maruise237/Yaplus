import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

// Outfit : la police du logotype (kit de marque v1).
const font = Outfit({ subsets: ["latin"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  title: "Yaplus",
  description: "Le cahier de réapprovisionnement partagé de la boutique.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Yaplus", statusBarStyle: "default" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon-180.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1e1e" },
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
