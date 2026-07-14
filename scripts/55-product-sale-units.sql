-- Product packaging + category FK for Theos Art shop
-- Run in Supabase SQL Editor (safe to re-run).

ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_unit TEXT DEFAULT 'piece';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_quantity INT DEFAULT 1;

UPDATE products
SET sale_unit = 'piece'
WHERE sale_unit IS NULL OR sale_unit = '';

UPDATE products
SET pack_quantity = 1
WHERE pack_quantity IS NULL OR pack_quantity < 1;

-- Optional FK so PostgREST embeds work if you use them later
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add products_category_id_fkey: %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';
