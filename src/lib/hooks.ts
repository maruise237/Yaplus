"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState, useSyncExternalStore } from "react";
import { db, type Category, type Product, type ShopMember } from "./db";
import { getCurrentShopId, getSession } from "./session";
import { syncStore } from "./sync";

export function useSession() {
  // undefined = en cours de chargement, null = pas connecté
  return useLiveQuery(async () => (await getSession()) ?? null, []);
}

export function useCurrentShop() {
  return useLiveQuery(async () => {
    const session = await getSession();
    if (!session) return null;
    const memberships = (await db.shop_members.where("user_id").equals(session.userId).toArray()).filter((m) => !m.removed_at);
    const shops = (await db.shops.bulkGet(memberships.map((m) => m.shop_id))).filter((s) => s && !s.archived_at);
    if (!shops.length) return null;
    const currentId = await getCurrentShopId();
    const shop = shops.find((s) => s!.id === currentId) ?? shops[0]!;
    const role = memberships.find((m) => m.shop_id === shop.id)!.role;
    return { shop, role, isOwner: role === "owner", session };
  }, []);
}

const NO_CATEGORIES: Category[] = [];
const NO_PRODUCTS: Product[] = [];

export function useCategories(shopId: string | undefined): Category[] {
  const rows = useLiveQuery(async (): Promise<Category[]> => {
    if (!shopId) return [];
    const rows = await db.categories.where("shop_id").equals(shopId).toArray();
    return rows.filter((c) => !c.archived_at).sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
  }, [shopId]);
  return rows ?? NO_CATEGORIES;
}

export function useProducts(shopId: string | undefined): Product[] {
  const rows = useLiveQuery(async (): Promise<Product[]> => {
    if (!shopId) return [];
    const rows = await db.products.where("shop_id").equals(shopId).toArray();
    return rows.filter((p) => !p.archived_at).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [shopId]);
  return rows ?? NO_PRODUCTS;
}

export function useMembers(shopId: string | undefined) {
  return useLiveQuery(async () => {
    const map = new Map<string, ShopMember>();
    if (!shopId) return map;
    for (const m of await db.shop_members.where("shop_id").equals(shopId).toArray()) map.set(m.user_id, m);
    return map;
  }, [shopId]);
}

export function usePendingCount() {
  return useLiveQuery(() => db.outbox.count(), []) ?? 0;
}

export function useFailedCount() {
  return useLiveQuery(() => db.outbox.filter((e) => Boolean(e.error)).count(), []) ?? 0;
}

export function useSyncState() {
  return useSyncExternalStore(syncStore.subscribe, syncStore.get, syncStore.get);
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}
