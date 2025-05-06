-- shopping_list_items に item_id 列を追加し、
-- items.id への外部キーを張る
alter table shopping_list_items
  add column if not exists item_id uuid;

alter table shopping_list_items
  add constraint shopping_list_items_item_id_fkey
  foreign key (item_id) references items(id)
  on delete cascade;
