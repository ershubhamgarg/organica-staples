-- Replace the coarse category-level HSN defaults from the previous migration
-- with precise 8-digit HSN codes per product, matching the granularity
-- required on a compliant GST tax invoice (see 20260902000000_gst_invoices.sql).
--
-- These are a best-effort classification based on standard Indian Customs
-- Tariff / GST HSN schedules. Two are flagged below as needing extra care —
-- please have your CA confirm the full list, and these two in particular,
-- before your first real invoice goes out.

-- Flour & Grains
update products set hsn_code = '11010000' where id = 0;  -- Khapli Whole Wheat Flour
update products set hsn_code = '11029090' where id = 1;  -- Diabetes care Flour — CHECK: blended/multi-grain flour, classification depends on exact composition
update products set hsn_code = '11061000' where id = 17; -- Besan - Gram flour

-- Oils & Ghee
update products set hsn_code = '15131100' where id = 2;  -- Cold Pressed Coconut Oil — CHECK: crude/virgin vs refined classification
update products set hsn_code = '15149110' where id = 3;  -- Cold Pressed Mustard Oil — CHECK: crude vs refined classification

-- Spices
update products set hsn_code = '09103020' where id = 4;  -- Pure Turmeric Powder
update products set hsn_code = '13019032' where id = 12; -- Heeng Powder (Asafoetida)
update products set hsn_code = '09042210' where id = 11; -- Byadgi Red Chilli Powder
update products set hsn_code = '09092200' where id = 13; -- Coriander Powder
update products set hsn_code = '09083100' where id = 16; -- Green Cardamom
update products set hsn_code = '09109990' where id = 21; -- Mango Powder - Amchur
update products set hsn_code = '09093121' where id = 22; -- Cumin seeds - Jeera

-- Pulses & Dals
update products set hsn_code = '07133110' where id = 5;  -- Moong Dal Chhilka
update products set hsn_code = '07132000' where id = 14; -- Unpolished Chana Dal
update products set hsn_code = '07133120' where id = 23; -- Urad dal
update products set hsn_code = '07136000' where id = 25; -- Arhar/Tur Dal

-- Seeds
update products set hsn_code = '12040090' where id = 6;  -- Flax Seeds
update products set hsn_code = '12079990' where id = 7;  -- Chia Seeds
update products set hsn_code = '12077090' where id = 8;  -- Pumpkin Seeds
update products set hsn_code = '12060000' where id = 9;  -- Sunflower Seeds

-- Dry Fruits
update products set hsn_code = '08021200' where id = 19; -- Almonds
update products set hsn_code = '08013200' where id = 20; -- Cashews
