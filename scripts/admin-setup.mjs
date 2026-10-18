// Génère les réglages du panneau d'administration caché.
// Usage : node scripts/admin-setup.mjs 237699001122
// Copie les lignes affichées dans les variables d'environnement Vercel (et .env.local),
// puis ajoute le secret TOTP dans ton appli d'authentification (Google Authenticator, Aegis…).
import { randomBytes } from "node:crypto";

const phone = (process.argv[2] ?? "").replace(/\D/g, "");
if (!phone) {
  console.error("Indique le numéro du compte admin, indicatif compris : node scripts/admin-setup.mjs 237699001122");
  process.exit(1);
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const bits = [...randomBytes(20)].map((b) => b.toString(2).padStart(8, "0")).join("");
const secret = bits.match(/.{5}/g).map((b) => alphabet[parseInt(b, 2)]).join("");
const path = randomBytes(18).toString("base64url");

console.log(`ADMIN_PATH=${path}`);
console.log(`ADMIN_TOTP_SECRET=${secret}`);
console.log(`ADMIN_PHONES=${phone}`);
console.log("");
console.log(`Appli d'authentification : otpauth://totp/Yaplus:admin?secret=${secret}&issuer=Yaplus`);
console.log(`Adresse du panneau : https://<ton-domaine>/${path}`);
