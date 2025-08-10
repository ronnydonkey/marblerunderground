-- Enable Row Level Security on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE piece_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE piece_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE piece_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Public read access to catalog data (active items only)
CREATE POLICY "Public read access to active brands" ON brands
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Public read access to active product sets" ON product_sets
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Public read access to active piece types" ON piece_types
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Public read access to piece photos" ON piece_photos
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Public read access to piece compatibility" ON piece_compatibility
    FOR SELECT TO public
    USING (true);

-- Admin full access to catalog data
CREATE POLICY "Admin full access to brands" ON brands
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin full access to product sets" ON product_sets
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin full access to piece types" ON piece_types
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin full access to piece photos" ON piece_photos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Users can contribute to piece compatibility
CREATE POLICY "Users can read piece compatibility" ON piece_compatibility
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can add piece compatibility" ON piece_compatibility
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = verified_by);

CREATE POLICY "Users can update their compatibility entries" ON piece_compatibility
    FOR UPDATE TO authenticated
    USING (auth.uid() = verified_by)
    WITH CHECK (auth.uid() = verified_by);

-- Admin can manage all compatibility entries
CREATE POLICY "Admin full access to piece compatibility" ON piece_compatibility
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Users can only access their own collection data
CREATE POLICY "Users can manage their own collections" ON user_collections
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admin can view all collections (for analytics/support)
CREATE POLICY "Admin read access to all collections" ON user_collections
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );