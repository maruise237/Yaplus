import { findModele, MODELES } from "@/content/modeles";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => MODELES.map((x) => ({ slug: x.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = findModele((await params).slug);
  return ogImage(page?.title ?? "Yaplus");
}
