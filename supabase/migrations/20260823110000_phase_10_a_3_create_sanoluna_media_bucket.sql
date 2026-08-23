-- Create sanoluna-media bucket and storage policies
-- Bucket should be public so images can be served directly

INSERT INTO storage.buckets (id, name, public)
VALUES ('sanoluna-media', 'sanoluna-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public can read sanoluna-media
CREATE POLICY "Public can view sanoluna-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sanoluna-media');

-- Policy: Admin and Manager can insert sanoluna-media
CREATE POLICY "Admin and manager can insert sanoluna-media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sanoluna-media' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Policy: Admin and Manager can update sanoluna-media
CREATE POLICY "Admin and manager can update sanoluna-media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'sanoluna-media' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    bucket_id = 'sanoluna-media' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Policy: Admin and Manager can delete sanoluna-media
CREATE POLICY "Admin and manager can delete sanoluna-media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sanoluna-media' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );
