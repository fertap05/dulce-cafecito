-- Dulce Cafecito
-- Per-product customization values
--
-- Run this once in Supabase SQL Editor BEFORE deploying
-- the feature/per-product-customizations branch.

create table if not exists public.product_option_values (
  product_id bigint not null
    references public.products(id)
    on delete cascade,

  option_value_id bigint not null
    references public.option_values(id)
    on delete cascade,

  created_at timestamptz not null
    default now(),

  primary key (
    product_id,
    option_value_id
  )
);

create index if not exists
  product_option_values_option_value_id_idx
on public.product_option_values (
  option_value_id
);

-- Preserve today's behavior for every existing product:
-- if a product currently has an option group assigned,
-- all active values in that group start enabled.
insert into public.product_option_values (
  product_id,
  option_value_id
)
select
  pog.product_id,
  ov.id
from public.product_option_groups as pog
join public.option_values as ov
  on ov.option_group_id =
    pog.option_group_id
where ov.is_active = true
on conflict (
  product_id,
  option_value_id
) do nothing;

alter table
  public.product_option_values
enable row level security;

drop policy if exists
  "Public can read product option values"
on public.product_option_values;

create policy
  "Public can read product option values"
on public.product_option_values
for select
to anon, authenticated
using (true);
