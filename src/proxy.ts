import { NextResponse, type NextRequest } from "next/server";

// Le panneau d'administration vit en interne sous /admin mais n'est servi que sous
// l'adresse secrète ADMIN_PATH. Taper /admin donne la même page 404 qu'une adresse inconnue.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = process.env.ADMIN_PATH ?? "";
  const base = /^[\w-]{16,}$/.test(slug) ? `/${slug}` : null;

  if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname.slice(base.length)}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-Frame-Options", "DENY");
    return res;
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/_introuvable", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.\\w+$).*)"],
};
