-- Create storage bucket for asset images
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-aat6qq6efrpd_assets_images', 'app-aat6qq6efrpd_assets_images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-aat6qq6efrpd_assets_images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-aat6qq6efrpd_assets_images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-aat6qq6efrpd_assets_images');