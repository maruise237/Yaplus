import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Outfit : la police du logotype (kit de marque v1).
const font = Outfit({ subsets: ["latin"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Le cahier de réapprovisionnement partagé de la boutique.",
  applicationName: SITE_NAME,
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
      <body>{children}</body>
    </html>
  );
}
