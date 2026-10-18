"use client";

import { Check, LogOut, MessageCircle, Plus, UserPlus } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { TextFieldDialog } from "@/components/TextFieldDialog";
import { Button } from "@/components/ui/button";
import { createShop, removeMember, renameMember, renameShop } from "@/lib/actions";
import { api, isCloudConfigured } from "@/lib/cloud";
import { db, type ShopMember } from "@/lib/db";
import { useCurrentShop, useMembers } from "@/lib/hooks";
import { createInvite, inviteLink } from "@/lib/invites";
import { saveSession, setCurrentShopId, signOutLocal } from "@/lib/session";
import { syncNow } from "@/lib/sync";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="grid gap-2.5">
      <div className="flex min-h-9 items-center justify-between px-1">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function BoutiquePage() {
  const router = useRouter();
  const current = useCurrentShop();
  const shopId = current?.shop.id;
  const members = useMembers(shopId);
  const [dialog, setDialog] = useState<null | "shop-name" | "my-name" | "new-shop" | "invite" | "sign-out">(null);
  const [removing, setRemoving] = useState<ShopMember | null>(null);

  // Vue patron multi-boutiques : ce qui manque dans chaque boutique, en direct.
  const overview = useLiveQuery(async () => {
    if (!current) return [];
    const mine = (await db.shop_members.where("user_id").equals(current.session.userId).toArray()).filter((m) => !m.removed_at);
    return Promise.all(
      mine.map(async (m) => {
        const shop = await db.shops.get(m.shop_id);
        const toBuy = (await db.products.where("[shop_id+status]").equals([m.shop_id, "to_buy"]).toArray()).filter((p) => !p.archived_at);
        toBuy.sort((a, b) => (b.flagged_at ?? "").localeCompare(a.flagged_at ?? ""));
        return { shop, count: toBuy.length, latest: toBuy.slice(0, 3).map((p) => p.name) };
      }),
    );
  }, [current?.session.userId]);

  if (!current || !shopId) return null;
  const { shop, isOwner, session } = current;
  const team = [...(members?.values() ?? [])].filter((m) => !m.removed_at).sort((a, b) => Number(b.role === "owner") - Number(a.role === "owner"));

  const signOut = async () => {
    if (isCloudConfigured) {
      // Dernier envoi avant d'effacer l'appareil, puis fin de la session serveur.
      await syncNow();
      await api("/api/auth/signout").catch(() => {});
    }
    await signOutLocal();
    router.replace("/connexion");
  };

  return (
    <>
      <PageHeader
        title={shop.name}
        aside={
          isOwner && (
            <Button variant="ghost" size="touch" className="-mr-3 text-primary" onClick={() => setDialog("shop-name")}>
              Renommer
            </Button>
          )
        }
      />

      <div className="grid gap-8">
        {overview && overview.length > 1 && (
          <Section title="Mes boutiques">
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
              {overview.map((o) =>
                o.shop ? (
                  <li key={o.shop.id}>
                    <button
                      type="button"
                      onClick={() => void setCurrentShopId(o.shop!.id).then(() => router.push("/a-racheter"))}
                      className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-semibold">
                          {o.shop.name}
                          {o.shop.id === shopId && <Check className="size-4 text-primary" aria-label="Boutique ouverte" />}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">{o.latest.length ? o.latest.join(", ") : "Rien ne manque"}</span>
                      </span>
                      {o.count > 0 && <span className="text-sm font-semibold text-flag-text tabular-nums">{o.count} à racheter</span>}
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </Section>
        )}

        <Section
          title="Équipe"
          action={
            isOwner && (
              <Button variant="ghost" size="touch" className="-mr-3 text-primary" onClick={() => setDialog("invite")}>
                <UserPlus aria-hidden />
                Inviter
              </Button>
            )
          }
        >
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {team.map((m) => {
              const me = m.user_id === session.userId;
              return (
                <li key={m.user_id} className="flex min-h-16 items-center gap-3 px-4 py-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold" aria-hidden>
                    {m.display_name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {m.display_name}
                      {me && <span className="font-normal text-muted-foreground"> (toi)</span>}
                    </span>
                    <span className="block text-sm text-muted-foreground">{m.role === "owner" ? "Patron" : "Employé"}</span>
                  </span>
                  {me ? (
                    <Button variant="ghost" size="touch" className="-mr-2 text-primary" onClick={() => setDialog("my-name")}>
                      Modifier
                    </Button>
                  ) : (
                    isOwner &&
                    m.role !== "owner" && (
                      <Button variant="ghost" size="touch" className="-mr-2 text-muted-foreground" onClick={() => setRemoving(m)}>
                        Retirer
                      </Button>
                    )
                  )}
                </li>
              );
            })}
          </ul>
          {!isCloudConfigured && isOwner && (
            <p className="px-1 text-sm text-muted-foreground">Les invitations s’activent quand le serveur est branché. Pour l’instant, le cahier reste sur ce téléphone.</p>
          )}
        </Section>

        <Section title="Compte">
          <div className="grid gap-2 sm:flex">
            <Button variant="outline" size="touch" onClick={() => setDialog("new-shop")}>
              <Plus aria-hidden />
              Ajouter une boutique
            </Button>
            <Button variant="ghost" size="touch" className="justify-start text-muted-foreground" onClick={() => setDialog("sign-out")}>
              <LogOut aria-hidden />
              Se déconnecter
            </Button>
          </div>
        </Section>
      </div>

      <TextFieldDialog
        open={dialog === "shop-name"}
        onOpenChange={(o) => setDialog(o ? "shop-name" : null)}
        title="Renommer la boutique"
        label="Nom de la boutique"
        initialValue={shop.name}
        onSubmit={(name) => void renameShop(shopId, name)}
      />
      <TextFieldDialog
        open={dialog === "my-name"}
        onOpenChange={(o) => setDialog(o ? "my-name" : null)}
        title="Ton prénom"
        label="Prénom affiché à l’équipe"
        initialValue={session.displayName}
        onSubmit={async (name) => {
          await saveSession({ ...session, displayName: name });
          await renameMember(shopId, session.userId, name);
        }}
      />
      <TextFieldDialog
        open={dialog === "new-shop"}
        onOpenChange={(o) => setDialog(o ? "new-shop" : null)}
        title="Nouvelle boutique"
        label="Nom de la boutique"
        placeholder="Ex. Boutique Akwa 2…"
        submitLabel="Créer la boutique"
        onSubmit={async (name) => {
          await createShop(name);
          router.push("/");
        }}
      />
      <InviteSheet open={dialog === "invite"} onOpenChange={(o) => setDialog(o ? "invite" : null)} shopId={shopId} shopName={shop.name} />
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Retirer ${removing?.display_name} ?`}
        description="Il n’aura plus accès au cahier. Ses signalements restent visibles."
        confirmLabel="Retirer"
        destructive
        onConfirm={async () => {
          if (removing) await removeMember(shopId, removing.user_id);
        }}
      />
      <ConfirmDialog
        open={dialog === "sign-out"}
        onOpenChange={(o) => setDialog(o ? "sign-out" : null)}
        title="Se déconnecter ?"
        description={
          session.mode === "local"
            ? "Le cahier est seulement sur ce téléphone : il sera effacé."
            : "Les actions pas encore synchronisées seront perdues."
        }
        confirmLabel="Se déconnecter"
        destructive
        onConfirm={signOut}
      />
    </>
  );
}

function InviteSheet({ open, onOpenChange, shopId, shopName }: { open: boolean; onOpenChange: (o: boolean) => void; shopId: string; shopName: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      setCode(await createInvite(shopId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer l’invitation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setCode(null);
      }}
      title="Inviter un employé"
      description="Il reçoit un lien, se connecte avec son numéro et arrive dans le cahier."
      footer={
        code ? (
          <Button size="touch-lg" asChild>
            <a href={whatsappLink(`Rejoins le cahier de ${shopName} sur Yaplus : ${inviteLink(code)}`)} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden />
              Envoyer par WhatsApp
            </a>
          </Button>
        ) : (
          <Button size="touch-lg" onClick={() => void generate()} disabled={busy || !isCloudConfigured}>
            {busy ? "Création…" : "Créer une invitation"}
          </Button>
        )
      }
    >
      {code ? (
        <div className="rounded-lg bg-secondary px-4 py-5 text-center">
          <p className="text-3xl font-bold tracking-[0.25em] tabular-nums" translate="no">
            {code}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Valable 24 heures, pour une personne.</p>
        </div>
      ) : (
        <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>
          {error ?? (isCloudConfigured ? "Un code à usage unique sera créé." : "Disponible quand le serveur est branché.")}
        </p>
      )}
    </ResponsiveSheet>
  );
}
