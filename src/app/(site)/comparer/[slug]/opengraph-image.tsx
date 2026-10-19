import { findComparison, COMPARISONS } from "@/content/comparer";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => COMPARISONS.map((x) => ({ slug: x.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = findComparison((await params).slug);
  return ogImage(page?.h1 ?? "Yaplus");
}
