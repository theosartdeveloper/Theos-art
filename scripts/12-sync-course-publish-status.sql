-- Sync course publish status (legacy is_published → status column)
-- Run in Supabase SQL Editor if /learning is empty but admin overview shows courses.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'is_published'
  ) THEN
    UPDATE courses SET status = 'published' WHERE is_published = true AND status IS DISTINCT FROM 'published';
    UPDATE courses SET status = 'draft' WHERE is_published = false AND (status IS NULL OR status = 'published');
  END IF;

  UPDATE courses SET status = 'draft' WHERE status IS NULL;
END $$;

-- Optional: publish default Theos Art Learning programme titles (if present)
UPDATE courses
SET status = 'published', updated_at = NOW()
WHERE title IN (
  'Creative Fundamentals',
  'Painting & Studio Practice',
  'Workshops & Events',
  'Original Artworks',
  'Art Materials'
);

NOTIFY pgrst, 'reload schema';

SELECT id, title, status, is_published, created_at
FROM courses
ORDER BY created_at DESC;
