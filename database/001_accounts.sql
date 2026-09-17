-- Run once in the SQL editor of YOUR Supabase project. Contains no activity data.
begin;
create table if not exists public.billing_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 stripe_customer_id text not null unique,
 deleting boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.billing_events (
 event_id text primary key,
 event_type text not null,
 received_at timestamptz not null default now()
);
create table if not exists public.request_limits (
 key text primary key,
 hits integer not null default 1,
 created_at timestamptz not null default now()
);
alter table public.billing_accounts enable row level security;
alter table public.billing_events enable row level security;
alter table public.request_limits enable row level security;
revoke all on public.billing_accounts, public.billing_events, public.request_limits from anon, authenticated;
grant all on public.billing_accounts, public.billing_events, public.request_limits to service_role;
-- No client-facing policies. Only server service-role requests may access these tables.
create or replace function public.consume_rate_limit(p_key text, p_max integer)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 if p_max < 1 or p_max > 100 or length(p_key) <> 64 then return false; end if;
 delete from public.request_limits where created_at < now() - interval '1 day';
 insert into public.request_limits(key,hits) values(p_key,1)
 on conflict(key) do update set hits=public.request_limits.hits+1 returning hits into n;
 return n<=p_max;
end; $$;
revoke all on function public.consume_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer) to service_role;
create table if not exists public.billing_locks (
 user_id uuid primary key references auth.users(id) on delete cascade,
 token uuid not null,
 expires_at timestamptz not null
);
alter table public.billing_locks enable row level security;
revoke all on public.billing_locks from anon,authenticated;
grant all on public.billing_locks to service_role;
create or replace function public.acquire_billing_lock(p_user uuid,p_token uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 insert into public.billing_locks(user_id,token,expires_at) values(p_user,p_token,now()+interval '90 seconds')
 on conflict(user_id) do update set token=excluded.token,expires_at=excluded.expires_at
 where public.billing_locks.expires_at < now();
 get diagnostics n = row_count;
 return n=1;
end; $$;
create or replace function public.release_billing_lock(p_user uuid,p_token uuid)
returns void language sql security definer set search_path=public,pg_temp as $$
 delete from public.billing_locks where user_id=p_user and token=p_token;
$$;
revoke all on function public.acquire_billing_lock(uuid,uuid),public.release_billing_lock(uuid,uuid) from public,anon,authenticated;
grant execute on function public.acquire_billing_lock(uuid,uuid),public.release_billing_lock(uuid,uuid) to service_role;
commit;
