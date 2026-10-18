import { closeList, createProduct, createShop, setBought, setNote, toggleProduct } from "./actions";
import { db } from "./db";
import { saveSession } from "./session";

// Boutique d'exemple pour montrer l'app (et la tester) sans rien saisir.
// Uniquement en mode « sur cet appareil » : rien n'est envoyé au serveur.
const PAUL = "00000000-0000-4000-8000-00000000000a";

const CATALOGUE: Record<string, string[]> = {
  Afficheurs: ["KG5", "Tecno Spark 10", "Itel A100", "Infinix Hot 30", "Samsung A05"],
  Batteries: ["Batterie Itel BL-5CT", "Batterie Tecno BL-49", "Batterie Nokia BL-5C"],
  Chargeurs: ["Chargeur Type-C 18 W", "Chargeur micro-USB", "Câble Type-C 1 m"],
  Accessoires: ["Écouteurs filaires", "Support voiture", "Carte mémoire 32 Go"],
  Pochettes: ["Pochette Itel A100", "Pochette Tecno Spark 10", "Pochette Samsung A05"],
  Pièces: ["Connecteur de charge", "Nappe d'écran", "Vitre arrière"],
};

export async function seedDemo(): Promise<void> {
  const owner = crypto.randomUUID();
  await saveSession({ userId: owner, displayName: "Jules", phone: null, mode: "local" });
  const shop = await createShop("Boutique Akwa", "telephonie");
  const now = new Date().toISOString();
  await db.shop_members.put({
    shop_id: shop.id,
    user_id: PAUL,
    role: "employee",
    display_name: "Paul",
    joined_at: now,
    removed_at: null,
    updated_at: now,
  });

  const categories = await db.categories.where("shop_id").equals(shop.id).toArray();
  const byName = new Map<string, string>();
  for (const c of categories) {
    for (const name of CATALOGUE[c.name] ?? []) {
      const p = await createProduct(shop.id, c.id, name, { flag: false });
      byName.set(name, p.id);
    }
  }

  // Une première tournée d'achats, clôturée avec deux oubliés.
  for (const name of ["Itel A100", "Chargeur Type-C 18 W", "Pochette Itel A100", "Câble Type-C 1 m"]) await toggleProduct(byName.get(name)!);
  await setBought(byName.get("Chargeur Type-C 18 W")!, true);
  await setBought(byName.get("Câble Type-C 1 m")!, true);
  await closeList(shop.id, "237699001122");

  // La liste du moment.
  for (const name of ["KG5", "Infinix Hot 30", "Batterie Itel BL-5CT", "Écouteurs filaires"]) await toggleProduct(byName.get(name)!);
  await setNote(byName.get("KG5")!, "x3");
  await setNote(byName.get("Écouteurs filaires")!, "urgent");
  // Signalements faits par l'employé.
  for (const name of ["Infinix Hot 30", "Écouteurs filaires"]) {
    await db.products.update(byName.get(name)!, { flagged_by: PAUL });
  }
  await db.outbox.clear();
}
