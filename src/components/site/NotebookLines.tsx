// Les lignes d'écriture d'un cahier Seyès (une forte toutes les quatre), en haut de page,
// qui s'effacent vers le bas. Seulement horizontales : du papier ligné, pas une grille.
export function NotebookLines({ className = "h-[64rem] lg:h-[54rem]" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 top-0 w-full text-brand dark:opacity-70 [mask-image:linear-gradient(to_bottom,black_45%,transparent_95%)] ${className}`}
      aria-hidden
    >
      <defs>
        <pattern id="notebook-lines" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H32" stroke="currentColor" strokeOpacity="0.14" />
          <path d="M0 8.5H32M0 16.5H32M0 24.5H32" stroke="currentColor" strokeOpacity="0.06" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#notebook-lines)" />
    </svg>
  );
}

// La marge rouge du cahier, qui court le long de la page.
export function NotebookMargin() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2" aria-hidden>
      <div className="absolute inset-y-0 left-3 w-px bg-flag/35 sm:left-5" />
    </div>
  );
}
