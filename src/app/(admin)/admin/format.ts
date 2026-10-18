// Affichage des données du panneau : numéros lisibles, dates relatives en français.

export function formatPhone(digits: string): string {
  if (digits.startsWith("237") && digits.length === 12) {
    return `+237 ${digits[3]} ${digits.slice(4).match(/.{2}/g)!.join(" ")}`;
  }
  return `+${digits}`;
}

const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}

export function ago(date: Date | string | null, now = Date.now()): string {
  if (!date) return "jamais";
  const seconds = (new Date(date).getTime() - now) / 1000;
  if (seconds < -30 * 86_400) return `le ${new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "à l’instant";
}
