// Fond des écrans de découverte : la marque « Y+ » du kit, en très grand et très pâle,
// à peine coupée par le bord de l'écran, plus une croix isolée. Purement décoratif.
const MARK = "M6 6H31L64 58.25V96H40V59.8ZM66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z";
const CROSS = "M66.5 6H81.5V19.5H95V34.5H81.5V48H66.5V34.5H53V19.5H66.5Z";

export function BrandBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-brand" aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className="absolute -top-[2%] -right-[16%] w-[78vw] max-w-[26rem] opacity-[0.07] sm:-right-[6%] md:top-[6%] md:right-[6%] md:w-[30rem] md:max-w-none dark:opacity-[0.1]"
      >
        <path fill="currentColor" d={MARK} />
      </svg>
      <svg viewBox="50 3 48 48" className="absolute bottom-[22%] left-4 w-9 opacity-[0.1] md:left-[8%] md:w-12 dark:opacity-[0.14]">
        <path fill="currentColor" d={CROSS} />
      </svg>
    </div>
  );
}
