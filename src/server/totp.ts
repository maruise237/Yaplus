import { createHmac, timingSafeEqual } from "node:crypto";

// Code à 6 chiffres des applis d'authentification (RFC 6238 : SHA-1, 30 secondes).
// On accepte le code précédent et le suivant pour absorber le décalage d'horloge du téléphone.
const STEP = 30;

function base32(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of input.replace(/[\s=]/g, "").toUpperCase()) {
    const v = alphabet.indexOf(c);
    if (v < 0) throw new Error("Secret TOTP invalide (base32 attendu)");
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

export function totpAt(secret: string, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32(secret)).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(now / 1000 / STEP);
  let ok = false;
  for (const c of [counter - 1, counter, counter + 1]) {
    ok = timingSafeEqual(Buffer.from(totpAt(secret, c)), Buffer.from(code)) || ok;
  }
  return ok;
}
