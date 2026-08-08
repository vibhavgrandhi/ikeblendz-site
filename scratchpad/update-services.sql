-- Replace placeholder services with the real IkeBlendz menu.
-- Run in Supabase SQL editor.

delete from services;

insert into services (name, description, price, duration_minutes, sort_order) values
  ('Design And Haircut', 'Custom design work with a full precision haircut.', 15, 40, 0),
  ('Beard/Mustache and Haircut', 'Haircut paired with beard and mustache shaping.', 20, 30, 1),
  ('Beard', 'Beard shaping and lineup.', 10, 10, 2);
