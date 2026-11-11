-- 042: Rekod ralat push NinjaVan pada order (HQ & fighter) — untuk tapisan "Perlu dibetulkan".
-- Diisi bila push gagal (semakan sistem atau NinjaVan tolak); dikosongkan bila push berjaya / order dibetulkan.

alter table public.submissions
  add column if not exists nv_error text,
  add column if not exists nv_error_at timestamptz;

alter table public.fighter_orders
  add column if not exists nv_error text,
  add column if not exists nv_error_at timestamptz;

create index if not exists submissions_nv_error_idx on public.submissions (nv_error_at) where nv_error is not null;
create index if not exists fighter_orders_nv_error_idx on public.fighter_orders (nv_error_at) where nv_error is not null;
