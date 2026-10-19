-- Yaplus — schéma v1 (Postgres Neon)
-- Les identifiants sont des UUID générés sur l'appareil (hors-ligne d'abord).
-- Rien n'est supprimé : on archive (archived_at / removed_at).
-- `synced_at` est posé par le serveur à chaque écriture et sert de curseur de synchro :
-- un appareil resté hors-ligne longtemps envoie des `updated_at` anciens, mais
-- `synced_at` garantit que les autres appareils le récupèrent quand même.
--
-- Pas de sécurité par ligne ici : la base n'est jamais exposée aux téléphones.
-- Les droits par boutique sont vérifiés par l'API (src/server/rules.ts).
-- Le script est rejouable : `npm run db:migrate`.

-- ---------------------------------------------------------------------------
-- Comptes : numéro de téléphone + mot de passe (aucun SMS, aucun e-mail)
-- ---------------------------------------------------------------------------

create table if not exists users (
  id uuid primary key,
  phone text not null unique,            -- chiffres seuls, indicatif compris (237…)
  display_name text not null,
  password_hash text not null,           -- scrypt, jamais en clair
  created_at timestamptz not null default now()
);

-- Échecs de connexion récents, pour freiner les essais de mot de passe en rafale.
create table if not exists auth_failures (
  phone text not null,
  at timestamptz not null default now()
);
create index if not exists auth_failures_phone_at on auth_failures (phone, at);

-- Journal du panneau d'administration : qui s'est connecté, quel lien de mot de passe a été créé.
create table if not exists admin_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid not null references users (id),
  action text not null,
  target text,
  ip text
);

-- Liens « nouveau mot de passe » créés par l'admin après vérification sur WhatsApp.
-- Seule l'empreinte du jeton est gardée : le lien lui-même n'est montré qu'une fois.
create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id),
  token_hash text not null unique,
  created_by uuid not null references users (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  used_at timestamptz,
  cancelled_at timestamptz
);
create index if not exists password_resets_user on password_resets (user_id);

-- Réglages modifiables depuis le panneau d'administration (ex. numéro WhatsApp du support).
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references users (id)
);

-- Support : une conversation par compte, comme un fil WhatsApp.
create table if not exists support_threads (
  user_id uuid primary key references users (id),
  last_at timestamptz not null default now(),
  closed_at timestamptz,                 -- posé par l'admin ; un nouveau message rouvre
  user_seen_at timestamptz               -- pour signaler une réponse pas encore lue
);

create table if not exists support_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references support_threads (user_id),
  shop_id uuid references shops (id),    -- boutique ouverte au moment du message
  from_admin boolean not null default false,
  author_id uuid not null references users (id),
  body text not null,
  at timestamptz not null default now()
);
create index if not exists support_messages_user on support_messages (user_id, at);

-- ---------------------------------------------------------------------------
-- Cahier
-- ---------------------------------------------------------------------------

create table if not exists shops (
  id uuid primary key,
  owner_id uuid not null references users (id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  synced_at timestamptz not null default now()
);

create table if not exists shop_members (
  shop_id uuid not null references shops (id),
  user_id uuid not null references users (id),
  role text not null check (role in ('owner', 'employee')),
  display_name text not null,
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id),
  code text not null unique,
  created_by uuid not null references users (id),
  expires_at timestamptz not null default now() + interval '24 hours',
  used_at timestamptz,
  used_by uuid references users (id),
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key,
  shop_id uuid not null references shops (id),
  name text not null,
  position integer not null default 0,
  created_by uuid references users (id),
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key,
  shop_id uuid not null references shops (id),
  category_id uuid not null references categories (id),
  name text not null,
  name_normalized text not null,
  status text not null default 'in_stock' check (status in ('in_stock', 'to_buy', 'bought')),
  note text,
  flagged_by uuid references users (id),
  flagged_at timestamptz,
  forgotten_count integer not null default 0,
  created_by uuid references users (id),
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

-- Journal append-only : jamais modifié, jamais supprimé.
create table if not exists product_events (
  id uuid primary key,
  product_id uuid not null references products (id),
  shop_id uuid not null references shops (id),
  type text not null check (type in ('created', 'flagged', 'restocked', 'bought')),
  user_id uuid not null references users (id),
  at timestamptz not null,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create table if not exists closures (
  id uuid primary key,
  shop_id uuid not null references shops (id),
  closed_by uuid not null references users (id),
  closed_at timestamptz not null,
  shared_to_phone text,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

-- Détail figé d'une clôture : les noms sont copiés pour que l'historique reste lisible.
create table if not exists closure_items (
  id uuid primary key,
  closure_id uuid not null references closures (id),
  shop_id uuid not null references shops (id),
  product_id uuid not null references products (id),
  product_name text not null,
  category_name text not null,
  bought boolean not null,
  note text,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now()
);

create index if not exists shop_members_user on shop_members (user_id);
create index if not exists shop_members_sync on shop_members (shop_id, synced_at);
create index if not exists categories_sync on categories (shop_id, synced_at);
create index if not exists products_sync on products (shop_id, synced_at);
create index if not exists products_name on products (shop_id, name_normalized);
create index if not exists product_events_sync on product_events (shop_id, synced_at);
create index if not exists closures_sync on closures (shop_id, synced_at);
create index if not exists closure_items_sync on closure_items (shop_id, synced_at);

-- ---------------------------------------------------------------------------
-- Synchro : curseur serveur + "la dernière modification gagne"
-- ---------------------------------------------------------------------------

create or replace function touch_synced_at() returns trigger
language plpgsql as $$
begin
  new.synced_at := now();
  return new;
end $$;

-- Si un appareil hors-ligne renvoie une version plus ancienne que celle du serveur,
-- on garde celle du serveur (comparaison sur updated_at).
create or replace function last_write_wins() returns trigger
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
    execute format('drop trigger if exists %I_synced_at on %I', t, t);
    execute format('drop trigger if exists %I_lww on %I', t, t);
    execute format('create trigger %I_synced_at before insert on %I for each row execute function touch_synced_at()', t, t);
    execute format('create trigger %I_lww before update on %I for each row execute function last_write_wins()', t, t);
  end loop;
end $$;
