-- ========== TABLES ==========
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text,
  price numeric(12,2) not null check (price >= 0),
  category text not null check (category in ('women','men','children')),
  type text not null,
  images text[] not null default '{}',
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_category_type_idx on public.products (category, type);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- reserved for optional shopper login later
  name text not null check (char_length(name) between 1 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index feedback_product_idx on public.feedback (product_id, created_at desc);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ========== ROW LEVEL SECURITY ==========
alter table public.products enable row level security;
alter table public.feedback enable row level security;
alter table public.admins   enable row level security;

create policy "products: public read"  on public.products for select using (true);
create policy "products: admin insert" on public.products for insert with check (public.is_admin());
create policy "products: admin update" on public.products for update using (public.is_admin()) with check (public.is_admin());
create policy "products: admin delete" on public.products for delete using (public.is_admin());

create policy "feedback: public read"   on public.feedback for select using (true);
create policy "feedback: anyone insert" on public.feedback for insert with check (user_id is null or user_id = auth.uid());
create policy "feedback: admin delete"  on public.feedback for delete using (public.is_admin());

create policy "admins: read own row" on public.admins for select using (user_id = auth.uid());

-- ========== STORAGE (product images) ==========
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "images: public read"  on storage.objects for select using (bucket_id = 'products');
create policy "images: admin upload" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
create policy "images: admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
create policy "images: admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- ========== MAKE YOURSELF ADMIN (run AFTER creating your user in Authentication > Users) ==========
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR-ADMIN-EMAIL';
