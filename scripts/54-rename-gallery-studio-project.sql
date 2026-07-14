-- Optional: rename legacy gallery type for Theos Art (safe to re-run)
UPDATE energy_library_items
SET gallery_type = 'studio_project',
    updated_at = NOW()
WHERE gallery_type = 'engineering_project';
