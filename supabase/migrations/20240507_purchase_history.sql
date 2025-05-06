-- 購入履歴テーブル
create table if not exists purchase_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  item_id uuid references items on delete cascade,
  qty numeric default 1,          -- 購入数
  price numeric default 0,        -- 1 回の購入金額 (円). API 取得失敗時は 0
  purchased_at timestamptz default now()
);
alter table purchase_history enable row level security;

-- RLS: 自分の履歴だけ見られる
create policy "ph_select_own"  on purchase_history for select using (user_id = auth.uid());
create policy "ph_insert_own"  on purchase_history for insert with check (user_id = auth.uid());

-- 集計ビュー
create or replace view v_purchase_summary as
select
  user_id,
  item_id,
  count(*)              as times_bought,
  sum(qty)              as total_qty,
  sum(price)            as total_spent,
  max(purchased_at)     as last_bought_at
from purchase_history
group by user_id, item_id;
