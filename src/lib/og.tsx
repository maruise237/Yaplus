import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (weight: 500 | 600) => readFile(join(process.cwd(), `node_modules/@fontsource/outfit/files/outfit-latin-${weight}-normal.woff`));

// Aperçu de partage (WhatsApp, Facebook, moteurs) : une page de cahier, le titre, le logo.
export async function ogImage(title: string, note = "Y a plus ? On le note.") {
  const [medium, semibold] = await Promise.all([font(500), font(600)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 60px 112px",
          backgroundColor: "#F8F7F4",
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(11,123,224,0.12) 31px, rgba(11,123,224,0.12) 32px)",
          fontFamily: "Outfit",
          color: "#2A2A2A",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 72, top: 0, bottom: 0, width: 2, backgroundColor: "rgba(215,38,61,0.45)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg viewBox="2 2 96 96" width="56" height="56">
            <path fill="#0B7BE0" d="M6 6H31L64 58.25V96H40V59.8ZM66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>Yaplus</span>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 64 : 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2.5, maxWidth: 980 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#65625C" }}>{note}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Outfit", data: medium, weight: 500, style: "normal" },
        { name: "Outfit", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
