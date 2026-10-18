// Normalisation des noms : minuscules, sans accents, ponctuation et espaces nettoyés.
// Sert à la suggestion anti-doublon et à la recherche.
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Score de proximité entre une saisie et un nom existant (0 = rien à voir, 1 = identique).
export function similarity(query: string, candidate: string): number {
  const q = normalizeName(query);
  const c = normalizeName(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  if (c.startsWith(q)) return 0.9;

  const qTokens = q.split(" ");
  const cTokens = c.split(" ");
  const allTokensFound = qTokens.every((t) => cTokens.some((ct) => ct.startsWith(t)));
  if (allTokensFound) return 0.85;
  if (c.includes(q)) return 0.8;

  const dist = levenshtein(q.replace(/ /g, ""), c.replace(/ /g, ""));
  const ratio = 1 - dist / Math.max(q.length, c.length);
  // "riz 50 kg" vs "riz 50kg", "afficheur kg5" vs "aficheur kg5"
  return ratio >= 0.75 ? ratio * 0.8 : 0;
}

export function findSimilar<T extends { name: string }>(query: string, items: T[], limit = 5, minScore = 0.6): T[] {
  return items
    .map((item) => ({ item, score: similarity(query, item.name) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map((r) => r.item);
}
