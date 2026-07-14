-- Stash MVP schema
-- Flexible for future: price_history, collection_members, ai enrichment

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create type public.product_status as enum (
  'want',
  'maybe',
  'buy_soon',
  'purchased',
  'archived'
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  image_url text,
  brand text,
  price numeric(12, 2),
  currency char(3) not null default 'USD',
  store text,
  product_url text,
  notes text,
  status public.product_status not null default 'want',
  is_favorite boolean not null default false,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_user_id_idx on public.products (user_id);
create index products_status_idx on public.products (user_id, status);
create index products_brand_idx on public.products (user_id, brand);
create index products_store_idx on public.products (user_id, store);
create index products_created_at_idx on public.products (user_id, created_at desc);
create index products_favorite_idx on public.products (user_id, is_favorite)
  where is_favorite = true;

-- Collections
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index collections_user_id_idx on public.collections (user_id);

-- Tags (unlimited per user)
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index tags_user_id_idx on public.tags (user_id);
create unique index tags_user_lower_name_idx on public.tags (user_id, lower(name));

-- Join: products ↔ collections
create table public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create index collection_products_product_id_idx
  on public.collection_products (product_id);

-- Join: products ↔ tags
create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

create index product_tags_tag_id_idx on public.product_tags (tag_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.collections enable row level security;
alter table public.tags enable row level security;
alter table public.collection_products enable row level security;
alter table public.product_tags enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can CRUD own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own collections"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own tags"
  on public.tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own collection_products"
  on public.collection_products for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
  );

create policy "Users can manage own product_tags"
  on public.product_tags for all
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.tags t
      where t.id = tag_id and t.user_id = auth.uid()
    )
  );

-- Search helper index (title, brand, store, notes)
create index products_search_idx on public.products
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(store, '') || ' ' ||
      coalesce(notes, '')
    )
  );
