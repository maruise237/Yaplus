import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { LogoMark } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { adminConfig, currentAdmin } from "@/server/admin";
import { query } from "@/server/db";
import { signOutAdmin } from "./actions";
import { AdminNav, AdminTabs } from "./AdminNav";
import { AdminSignIn } from "./AdminSignIn";

export const metadata: Metadata = { title: "Yaplus admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = adminConfig();
  const admin = await currentAdmin();

  if (!config || !admin) {
    return (
      <main className="mx-auto w-full max-w-sm px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-12 md:pt-[14vh]">
        <AdminSignIn />
      </main>
    );
  }

  const [{ waiting }] = await query<{ waiting: number }>(`
    select count(*)::int as waiting from support_threads t
    where t.closed_at is null
      and not (select m.from_admin from support_messages m where m.user_id = t.user_id order by m.at desc, m.id desc limit 1)`);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <LogoMark />
          <span className="font-semibold">Admin</span>
          <AdminNav base={config.base} waiting={waiting} className="ml-4 hidden md:flex" />
          <form action={signOutAdmin} className="ml-auto">
            <Button type="submit" variant="ghost" size="touch" className="text-muted-foreground max-md:size-11 max-md:px-0" aria-label="Se déconnecter">
              <LogOut aria-hidden />
              <span className="max-md:sr-only">Se déconnecter</span>
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-10 md:pb-16">{children}</main>
      <AdminTabs base={config.base} waiting={waiting} />
    </div>
  );
}
