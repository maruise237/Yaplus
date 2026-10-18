// Applique db/schema.sql sur la base Neon (rejouable sans risque).
// Usage : npm run db:migrate  (lit DATABASE_URL_UNPOOLED ou DATABASE_URL dans .env.local)
import { readFile } from "node:fs/promises";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant. Lance `vercel env pull .env.local` ou remplis .env.local.");
  process.exit(1);
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const pool = new Pool({ connectionString: url });
try {
  await pool.query(schema);
  const { rows } = await pool.query("select table_name from information_schema.tables where table_schema = 'public' order by 1");
  console.log("Schéma appliqué :", rows.map((r) => r.table_name).join(", "));
} finally {
  await pool.end();
}
