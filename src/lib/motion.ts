// Mouvements courts et sobres : ils montrent la cause et l'effet, rien de plus.
// Pas de rebond, pas de cascade à l'ouverture des pages.
export const ease = [0.2, 0, 0, 1] as const;
export const quick = { duration: 0.16, ease } as const;
export const base = { duration: 0.22, ease } as const;

// Entrée / sortie d'une ligne de liste (ajout, retrait, clôture).
export const listItem = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto", transition: base },
  exit: { opacity: 0, height: 0, transition: quick },
} as const;
