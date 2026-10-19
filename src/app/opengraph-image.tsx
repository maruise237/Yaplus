import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Yaplus, le cahier de réapprovisionnement de la boutique";

export default function Image() {
  return ogImage("Le cahier de la boutique, dans le téléphone.");
}
