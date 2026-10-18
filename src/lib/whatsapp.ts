export const DEFAULT_COUNTRY_CODE = "237"; // Cameroun

// Renvoie le numéro au format international, chiffres seulement (format attendu par wa.me).
export function normalizePhone(input: string, countryCode = DEFAULT_COUNTRY_CODE): string | null {
  const trimmed = input.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (trimmed.startsWith("+")) {
    // déjà international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith(countryCode) && digits.length > 9) {
    // déjà préfixé sans le +
  } else {
    digits = countryCode + digits.replace(/^0+/, "");
  }

  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export type ShareLine = { name: string; note?: string | null };
export type ShareGroup = { category: string; items: ShareLine[] };

export function buildShareMessage(shopName: string, groups: ShareGroup[], date = new Date()): string {
  const day = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const lines = [`*${shopName}* · À racheter`, day];
  for (const group of groups) {
    if (!group.items.length) continue;
    lines.push("", `*${group.category}*`);
    for (const item of group.items) {
      lines.push(`- ${item.name}${item.note ? ` (${item.note})` : ""}`);
    }
  }
  return lines.join("\n");
}

export function whatsappLink(message: string, phone?: string | null): string {
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
