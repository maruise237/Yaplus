-- Yaplus — schéma v1
-- Les identifiants sont des UUID générés sur l'appareil (hors-ligne d'abord).
-- Rien n'est supprimé : on archive (archived_at / removed_at).
-- `synced_at` est posé par le serveur à chaque écriture et sert de curseur de synchro :
-- un appareil resté hors-ligne longtemps envoie des `updated_at` anciens, mais
-- `synced_at` garantit que les autres appareils le récupèrent quand même.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.shops (
  id uuid primary key,
  owner_id uuid not null references auth.users (id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  synced_at timestamptz not null default now()
);

create table public.shop_members (
  shop_id uuid not null references public.shops (id),
  user_id uuid not null references auth.users (id),
  role text not null check (role in ('owner', 'employee')),
  display_name text not null,
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id),
  code text not null unique,
  created_by uuid not null references auth.users (id) default auth.uid(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key,
  shop_id uuid not null references public.shops (id),
  name text not null,
  position integer not null default 0,
  created_by uuid references auth.users (id),
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key,
  shop_id uuid not null references public.shops (id),
  category_id uuid not null references public.categories (id),
  name text not null,
  name_normalized text not null,
  status text not null default 'in_stock' check (status in ('in_stock', 'to_buy', 'bought')),
  note text,
  flagged_by uuid references auth.users (id),
  flagged_at timestamptz,
  forgotten_count integer not null default 0,
  created_by uuid references auth.users (id),
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

-- Journal append-only : jamais modifié, jamais supprimé.
create table public.product_events (
  id uuid primary key,
  product_id uuid not null references public.products (id),
  shop_id uuid not null references public.shops (id),
  type text not null check (type in ('created', 'flagged', 'restocked', 'bought')),
  user_id uuid not null references auth.users (id),
  at timestamptz not null,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table public.closures (
  id uuid primary key,
  shop_id uuid not null references public.shops (id),
  closed_by uuid not null references auth.users (id),
  closed_at timestamptz not null,
  shared_to_phone text,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

-- Détail figé d'une clôture : les noms sont copiés pour que l'historique reste lisible.
create table public.closure_items (
  id uuid primary key,
  closure_id uuid not null references public.closures (id),
  shop_id uuid not null references public.shops (id),
  product_id uuid not null references public.products (id),
  product_name text not null,
  category_name text not null,
  bought boolean not null,
  note text,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create index on public.shop_members (user_id);
create index on public.categories (shop_id, synced_at);
create index on public.products (shop_id, synced_at);
create index on public.products (shop_id, name_normalized);
create index on public.product_events (shop_id, synced_at);
create index on public.closures (shop_id, synced_at);
create index on public.closure_items (shop_id, synced_at);

-- ---------------------------------------------------------------------------
-- Synchro : curseur serveur + "la dernière modification gagne"
-- ---------------------------------------------------------------------------

create function public.touch_synced_at() returns trigger
language plpgsql as $$
begin
  new.synced_at := now();
  return new;
end $$;

-- Si un appareil hors-ligne renvoie une version plus ancienne que celle du serveur,
-- on garde celle du serveur (comparaison sur updated_at).
create function public.last_write_wins() returns trigger
language plpgsql as $$
begin
  if new.updated_at < old.updated_at then
    return old;
  end if;
  new.synced_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['shops','shop_members','invites','categories','products','product_events','closures','closure_items'] loop
    execute format('create trigger %I_synced_at before insert on public.%I for each row execute function public.touch_synced_at()', t, t);
    execute format('create trigger %I_lww before update on public.%I for each row execute function public.last_write_wins()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Sécurité par boutique (RLS)
-- ---------------------------------------------------------------------------

create function public.is_member(p_shop uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from shop_members
    where shop_id = p_shop and user_id = auth.uid() and removed_at is null
  );
$$;

create function public.is_owner(p_shop uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from shops where id = p_shop and owner_id = auth.uid())
      or exists (
        select 1 from shop_members
        where shop_id = p_shop and user_id = auth.uid() and role = 'owner' and removed_at is null
      );
$$;

alter table public.shops enable row level security;
alter table public.shop_members enable row level security;
alter table public.invites enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_events enable row level security;
alter table public.closures enable row level security;
alter table public.closure_items enable row level security;

-- Boutiques
create policy shops_select on public.shops for select using (public.is_member(id) or owner_id = auth.uid());
create policy shops_insert on public.shops for insert with check (owner_id = auth.uid());
create policy shops_update on public.shops for update using (public.is_owner(id)) with check (public.is_owner(id));

-- Membres : seul le patron gère l'équipe ; chacun peut changer son propre nom affiché.
create policy members_select on public.shop_members for select using (public.is_member(shop_id) or public.is_owner(shop_id));
-- Un membre existant peut "réécrire" sa propre ligne (upsert de synchro) ; le trigger
-- guard_member_update l'empêche de changer son rôle ou son statut.
create policy members_insert on public.shop_members for insert
  with check (public.is_owner(shop_id) or (user_id = auth.uid() and public.is_member(shop_id)));
create policy members_update_owner on public.shop_members for update using (public.is_owner(shop_id)) with check (public.is_owner(shop_id));
create policy members_update_self on public.shop_members for update
  using (user_id = auth.uid() and removed_at is null)
  with check (user_id = auth.uid() and removed_at is null);

create function public.guard_member_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner(old.shop_id)
     and coalesce(current_setting('yaplus.accepting_invite', true), '') <> 'on'
     and (new.role is distinct from old.role or new.removed_at is distinct from old.removed_at) then
    raise exception 'owner_only';
  end if;
  return new;
end $$;

create trigger shop_members_guard before update on public.shop_members
  for each row execute function public.guard_member_update();

-- Invitations : patron uniquement (l'employé passe par accept_invite).
create policy invites_owner on public.invites for all using (public.is_owner(shop_id)) with check (public.is_owner(shop_id));

-- Cahier : tous les membres actifs lisent et écrivent.
create policy categories_select on public.categories for select using (public.is_member(shop_id));
create policy categories_insert on public.categories for insert with check (public.is_member(shop_id));
create policy categories_update on public.categories for update using (public.is_member(shop_id)) with check (public.is_member(shop_id));

create policy products_select on public.products for select using (public.is_member(shop_id));
create policy products_insert on public.products for insert with check (public.is_member(shop_id));
create policy products_update on public.products for update using (public.is_member(shop_id)) with check (public.is_member(shop_id));

-- Journal : ajout seulement, en son propre nom.
create policy events_select on public.product_events for select using (public.is_member(shop_id));
create policy events_insert on public.product_events for insert with check (public.is_member(shop_id) and user_id = auth.uid());

-- Clôtures : lecture pour tous, écriture patron.
create policy closures_select on public.closures for select using (public.is_member(shop_id));
create policy closures_insert on public.closures for insert with check (public.is_owner(shop_id) and closed_by = auth.uid());

create policy closure_items_select on public.closure_items for select using (public.is_member(shop_id));
create policy closure_items_insert on public.closure_items for insert with check (public.is_owner(shop_id));

-- ---------------------------------------------------------------------------
-- Rejoindre une boutique avec un code d'invitation
-- ---------------------------------------------------------------------------

create function public.accept_invite(p_code text, p_display_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_invite invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite from invites
  where code = upper(trim(p_code)) and used_at is null and expires_at > now()
  for update;

  if not found then
    raise exception 'invalid_invite';
  end if;

  perform set_config('yaplus.accepting_invite', 'on', true);
  insert into shop_members (shop_id, user_id, role, display_name)
  values (v_invite.shop_id, auth.uid(), 'employee', p_display_name)
  on conflict (shop_id, user_id) do update
    set removed_at = null, display_name = excluded.display_name, updated_at = now();

  perform set_config('yaplus.accepting_invite', '', true);
  update invites set used_at = now(), used_by = auth.uid(), updated_at = now() where id = v_invite.id;

  return v_invite.shop_id;
end $$;

grant execute on function public.accept_invite(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Temps réel : le patron voit les signalements arriver sans recharger
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.products, public.categories, public.shop_members, public.closures;
