import Link from "next/link";

// Texte avec liens internes écrits [texte](/chemin).
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    return m ? (
      <Link key={i} href={m[2]} className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary">
        {m[1]}
      </Link>
    ) : (
      part
    );
  });
}
