import { findGuide, GUIDES } from "@/content/guides";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => GUIDES.map((x) => ({ slug: x.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = findGuide((await params).slug);
  return ogImage(page?.h1 ?? "Yaplus");
}
