"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createShop, removeMember, renameMember, renameShop } from "@/lib/actions";
import { db } from "@/lib/db";
import { useCurrentShop, useMembers } from "@/lib/hooks";
import { createInvite, inviteLink } from "@/lib/invites";
import { saveSession, setCurrentShopId, signOutLocal } from "@/lib/session";
import { getSupabase, isCloudConfigured } from "@/lib/supabase";
import { whatsappLink } from "@/lib/whatsapp";

export default function BoutiquePage() {
  const router = useRouter();
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const members = useMembers(shopId);
  const [invite, setInvite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vue patron multi-boutiques : les ruptures de chaque boutique, en direct.
  const overview = useLiveQuery(async () => {
    if (!current) return [];
    const mine = (await db.shop_members.where("user_id").equals(current.session.userId).toArray()).filter((m) => !m.removed_at);
    return Promise.all(
      mine.map(async (m) => {
        const shop = await db.shops.get(m.shop_id);
        const toBuy = (await db.products.where("[shop_id+status]").equals([m.shop_id, "to_buy"]).toArray()).filter((p) => !p.archived_at);
        toBuy.sort((a, b) => (b.flagged_at ?? "").localeCompare(a.flagged_at ?? ""));
        const team = new Map((await db.shop_members.where("shop_id").equals(m.shop_id).toArray()).map((x) => [x.user_id, x.display_name]));
        return { shop, role: m.role, count: toBuy.length, latest: toBuy.slice(0, 3).map((p) => ({ name: p.name, by: team.get(p.flagged_by ?? "") })) };
      }),
    );
  }, [current?.session.userId, current?.shop.id]);

  if (!current || !shopId) return null;
  const { shop, isOwner, session } = current;

  const makeInvite = async () => {
    setError(null);
    try {
      setInvite(await createInvite(shopId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const signOut = async () => {
    if (!confirm("Se déconnecter ? Les actions pas encore synchronisées seront perdues.")) return;
    await getSupabase()?.auth.signOut();
    await signOutLocal();
    router.replace("/connexion");
  };

  const changeMyName = async () => {
    const name = prompt("Ton prénom", session.displayName);
    if (!name?.trim()) return;
    await saveSession({ ...session, displayName: name.trim() });
    await renameMember(shopId, session.userId, name);
  };

  const card = "space-y-3 rounded-3xl border border-line bg-surface p-4";

  return (
    <div className="space-y-5">
      <section className={card}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">{shop.name}</h1>
          {isOwner && (
            <button
              className="text-sm text-muted"
              onClick={() => {
                const name = prompt("Nom de la boutique", shop.name);
                if (name?.trim()) void renameShop(shopId, name);
              }}
            >
              Renommer
            </button>
          )}
        </div>
        <p className="text-sm text-muted">
          Connecté en tant que <strong className="text-ink">{session.displayName}</strong> ({isOwner ? "patron" : "employé"}){" "}
          <button onClick={() => void changeMyName()} className="underline">
            modifier
          </button>
        </p>
      </section>

      {overview && overview.length > 1 && (
        <section className={card}>
          <h2 className="font-bold">Mes boutiques en direct</h2>
          {overview.map((o) =>
            o.shop ? (
              <button
                key={o.shop.id}
                onClick={() => void setCurrentShopId(o.shop!.id).then(() => router.push("/"))}
                className={`block w-full rounded-2xl border px-4 py-3 text-left ${o.shop.id === shopId ? "border-brand" : "border-line"}`}
              >
                <span className="flex justify-between font-semibold">
                  {o.shop.name}
                  <span className={o.count ? "text-brand" : "text-ok"}>{o.count ? `${o.count} à racheter` : "rien ne manque"}</span>
                </span>
                {o.latest.map((l, i) => (
                  <span key={i} className="block truncate text-sm text-muted">
                    {l.name}
                    {l.by && ` · ${l.by}`}
                  </span>
                ))}
              </button>
            ) : null,
          )}
        </section>
      )}

      <section className={card}>
        <h2 className="font-bold">Équipe</h2>
        {[...(members?.values() ?? [])]
          .filter((m) => !m.removed_at)
          .map((m) => (
            <div key={m.user_id} className="flex items-center justify-between">
              <span>
                {m.display_name} <span className="text-sm text-muted">· {m.role === "owner" ? "patron" : "employé"}</span>
              </span>
              {isOwner && m.role !== "owner" && (
                <button onClick={() => confirm(`Retirer ${m.display_name} ?`) && void removeMember(shopId, m.user_id)} className="text-sm text-brand">
                  Retirer
                </button>
              )}
            </div>
          ))}

        {isOwner &&
          (isCloudConfigured ? (
            invite ? (
              <div className="space-y-2 rounded-2xl bg-bg p-3">
                <p className="text-center text-3xl font-black tracking-[0.3em]">{invite}</p>
                <p className="text-center text-xs text-muted">Valable 7 jours, pour une personne.</p>
                <a
                  href={whatsappLink(`Rejoins le cahier de ${shop.name} sur Yaplus : ${inviteLink(invite)}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-[#25D366] px-4 py-3 text-center font-semibold text-white"
                >
                  Envoyer l&apos;invitation sur WhatsApp
                </a>
              </div>
            ) : (
              <button onClick={() => void makeInvite()} className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-brand-ink">
                Inviter un employé
              </button>
            )
          ) : (
            <p className="text-sm text-muted">Les invitations s&apos;activent une fois Supabase branché (voir README).</p>
          ))}
        {error && <p className="text-sm text-brand">{error}</p>}
      </section>

      <section className={card}>
        <button
          onClick={() => {
            const name = prompt("Nom de la nouvelle boutique");
            if (name?.trim()) void createShop(name).then(() => router.push("/"));
          }}
          className="w-full rounded-2xl border border-line px-4 py-3 font-medium"
        >
          + Ajouter une boutique
        </button>
        <button onClick={() => void signOut()} className="w-full px-4 py-2 text-sm text-muted">
          Se déconnecter
        </button>
      </section>
    </div>
  );
}
