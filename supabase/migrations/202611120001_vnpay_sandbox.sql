-- Sandbox-only payment records. The service-role Edge Functions are the only
-- application actors allowed to read or write this table.
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  txn_ref text not null unique check (txn_ref ~ '^[0-9]{14}[a-f0-9]{12}$'),
  listing_id text not null,
  listing_title text not null,
  amount_vnd integer not null check (amount_vnd > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  vnp_transaction_no text,
  vnp_bank_code text,
  vnp_pay_date text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists payment_orders_status_created_idx
  on public.payment_orders (status, created_at desc);

alter table public.payment_orders enable row level security;
revoke all on public.payment_orders from anon, authenticated;
grant all on public.payment_orders to service_role;
