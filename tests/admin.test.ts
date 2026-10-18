import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "../src/proxy";
import { totpAt, verifyTotp } from "../src/server/totp";

// Secret des vecteurs de test de la RFC 6238 ("12345678901234567890" en base32).
const SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("code TOTP", () => {
  it("donne les codes des vecteurs de la RFC 6238", () => {
    expect(totpAt(SECRET, Math.floor(59 / 30))).toBe("287082");
    expect(totpAt(SECRET, Math.floor(1111111109 / 30))).toBe("081804");
    expect(totpAt(SECRET, Math.floor(2000000000 / 30))).toBe("279037");
  });

  it("accepte le pas voisin, rien au-delà", () => {
    const now = 1111111109 * 1000;
    expect(verifyTotp(SECRET, "081804", now)).toBe(true);
    expect(verifyTotp(SECRET, totpAt(SECRET, Math.floor(now / 30000) + 1), now)).toBe(true);
    expect(verifyTotp(SECRET, totpAt(SECRET, Math.floor(now / 30000) + 3), now)).toBe(false);
    expect(verifyTotp(SECRET, "12345", now)).toBe(false);
    expect(verifyTotp(SECRET, "abcdef", now)).toBe(false);
  });
});

describe("adresse cachée du panneau", () => {
  const SLUG = "k3y-s3cr3t-0123456789";
  const run = (path: string) => proxy(new NextRequest(`https://yaplus.test${path}`));
  const rewrite = (res: Response) => res.headers.get("x-middleware-rewrite");

  afterEach(() => vi.unstubAllEnvs());

  it("sert le panneau seulement sous l'adresse secrète", () => {
    vi.stubEnv("ADMIN_PATH", SLUG);
    const res = run(`/${SLUG}/comptes`);
    expect(new URL(rewrite(res)!).pathname).toBe("/admin/comptes");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(new URL(rewrite(run(`/${SLUG}`))!).pathname).toBe("/admin");
  });

  it("répond au chemin interne comme à une page inconnue", () => {
    vi.stubEnv("ADMIN_PATH", SLUG);
    expect(new URL(rewrite(run("/admin"))!).pathname).toBe("/_introuvable");
    expect(new URL(rewrite(run("/admin/comptes"))!).pathname).toBe("/_introuvable");
    expect(rewrite(run(`/${SLUG}x`))).toBeNull();
    expect(rewrite(run("/administration"))).toBeNull();
  });

  it("reste fermé sans secret assez long", () => {
    vi.stubEnv("ADMIN_PATH", "short");
    expect(rewrite(run("/short"))).toBeNull();
    expect(new URL(rewrite(run("/admin"))!).pathname).toBe("/_introuvable");
  });
});
