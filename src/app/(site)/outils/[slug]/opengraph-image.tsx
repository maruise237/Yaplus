import { findTool, TOOLS } from "@/content/outils";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => TOOLS.map((x) => ({ slug: x.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = findTool((await params).slug);
  return ogImage(page?.name ?? "Yaplus");
}
