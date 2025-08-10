# Supabase Database Setup Guide

## Quick Setup Instructions

Instead of running scripts locally, you can set up the entire database directly in your Supabase dashboard.

### Step 1: Access Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your `lckljiicdebhdszeipkf` project
3. Go to **SQL Editor** in the left sidebar
4. Click **"New query"**

### Step 2: Run Initial Schema (Copy & Paste)

Paste this complete SQL script into the SQL editor and click **"Run"**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  country VARCHAR(2),
  founded_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_sets table
CREATE TABLE product_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  description TEXT,
  set_number VARCHAR,
  release_year INTEGER,
  age_range_min INTEGER,
  age_range_max INTEGER,
  piece_count INTEGER,
  msrp_usd DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Create piece_types table
CREATE TABLE piece_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('track', 'support', 'connector', 'special')),
  subcategory VARCHAR,
  dimensions JSONB,
  materials TEXT[],
  color VARCHAR,
  description TEXT,
  compatibility_notes TEXT,
  brand_specific_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Create piece_photos table
CREATE TABLE piece_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  angle VARCHAR CHECK (angle IN ('front', 'back', 'side', 'top', 'bottom', 'detail')),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID, -- references auth.users
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create piece_compatibility table
CREATE TABLE piece_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece1_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  piece2_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  compatibility_type VARCHAR NOT NULL CHECK (compatibility_type IN ('direct', 'adapter_required', 'incompatible')),
  adapter_piece_id UUID REFERENCES piece_types(id),
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  verified_by UUID, -- references auth.users
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(piece1_id, piece2_id),
  CHECK (piece1_id != piece2_id)
);

-- Create user_collections table
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- references auth.users
  piece_type_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  condition VARCHAR DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  notes TEXT,
  is_wishlist BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, piece_type_id, is_wishlist)
);

-- Create indexes for performance
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = true;
CREATE INDEX idx_product_sets_brand_slug ON product_sets(brand_id, slug);
CREATE INDEX idx_product_sets_active ON product_sets(is_active) WHERE is_active = true;
CREATE INDEX idx_piece_types_brand_category ON piece_types(brand_id, category);
CREATE INDEX idx_piece_types_active ON piece_types(is_active) WHERE is_active = true;
CREATE INDEX idx_piece_types_category ON piece_types(category);
CREATE INDEX idx_piece_photos_piece_primary ON piece_photos(piece_type_id, is_primary);
CREATE INDEX idx_piece_photos_sort ON piece_photos(piece_type_id, sort_order);
CREATE INDEX idx_compatibility_pieces ON piece_compatibility(piece1_id, piece2_id);
CREATE INDEX idx_compatibility_piece1 ON piece_compatibility(piece1_id);
CREATE INDEX idx_compatibility_piece2 ON piece_compatibility(piece2_id);
CREATE INDEX idx_user_collections_user ON user_collections(user_id, is_wishlist);
CREATE INDEX idx_user_collections_piece ON user_collections(piece_type_id);

-- Create search indexes using GIN
CREATE INDEX idx_brands_name_gin ON brands USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_piece_types_search_gin ON piece_types USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(compatibility_notes, '')));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sets_updated_at BEFORE UPDATE ON product_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_piece_types_updated_at BEFORE UPDATE ON piece_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_piece_compatibility_updated_at BEFORE UPDATE ON piece_compatibility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Set Up Row Level Security

Create another new query and run this SQL for security policies:

```sql
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
```

### Step 4: Add Sample Data

Create a final new query for sample data:

```sql
-- Insert sample brands
INSERT INTO brands (name, slug, description, website_url, country, founded_year) VALUES
('Gravitrax', 'gravitrax', 'The interactive track system by Ravensburger that combines creativity, engineering, and gravity to create endless possibilities.', 'https://www.gravitrax.com', 'DE', 2017),
('Marble Genius', 'marble-genius', 'Premium wooden marble run sets designed for both children and adults who love hands-on building experiences.', 'https://www.marblegenius.com', 'US', 2015),
('Hubelino', 'hubelino', 'Compatible marble run system that works with DUPLO bricks, combining the best of both construction worlds.', 'https://www.hubelino.com', 'DE', 2009),
('Quadrilla', 'quadrilla', 'Hape''s award-winning wooden marble run system featuring colorful blocks and innovative acceleration elements.', 'https://www.hape.com', 'DE', 1986),
('Marble Run', 'marble-run', 'Classic wooden marble run sets featuring traditional craftsmanship and timeless design principles.', null, 'US', 1995)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample product sets
INSERT INTO product_sets (brand_id, name, slug, description, set_number, release_year, age_range_min, age_range_max, piece_count, msrp_usd) VALUES
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'GraviTrax Starter Set', 'gravitrax-starter-set', 'The perfect entry point into the GraviTrax universe with essential track pieces and action elements.', '27590', 2017, 8, 99, 122, 59.99),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'GraviTrax XXL Starter Set', 'gravitrax-xxl-starter-set', 'Expanded starter set with more pieces and additional action elements for complex builds.', '27494', 2019, 8, 99, 226, 99.99),
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Marble Genius Extreme Set', 'marble-genius-extreme-set', 'Our largest wooden marble run with 85 pieces including curves, spirals, and multiple drop zones.', 'MG-EX85', 2020, 6, 99, 85, 129.99),
((SELECT id FROM brands WHERE slug = 'hubelino'), 'Hubelino Mega Building Set', 'hubelino-mega-building-set', 'Comprehensive set compatible with DUPLO featuring tunnels, curves, and speed elements.', '420473', 2018, 4, 10, 128, 89.99),
((SELECT id FROM brands WHERE slug = 'quadrilla'), 'Quadrilla Wooden Marble Run', 'quadrilla-wooden-marble-run', 'Beautifully crafted wooden marble run with colored blocks that create different marble paths.', 'E6009', 2016, 4, 99, 97, 149.99)
ON CONFLICT (brand_id, slug) DO NOTHING;

-- Insert sample piece types
INSERT INTO piece_types (brand_id, name, slug, category, subcategory, dimensions, materials, color, description, compatibility_notes) VALUES
-- GraviTrax pieces
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Straight Track', 'straight-track', 'track', 'straight', '{"length": 96, "width": 48, "height": 8}', ARRAY['plastic'], 'gray', 'Basic straight track piece that forms the foundation of any GraviTrax build.', 'Compatible with all GraviTrax track pieces via magnetic connections.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Curved Track', 'curved-track', 'track', 'curved', '{"length": 96, "width": 96, "height": 8}', ARRAY['plastic'], 'gray', '90-degree curved track piece for creating turns and loops in your marble path.', 'Magnetic connections compatible with all GraviTrax track system.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Height Tile', 'height-tile', 'support', 'elevation', '{"length": 96, "width": 48, "height": 21}', ARRAY['plastic'], 'gray', 'Foundation tile that elevates track pieces to create multi-level builds.', 'Essential for creating height differences in GraviTrax systems.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Cannon', 'cannon', 'special', 'launcher', '{"length": 96, "width": 48, "height": 35}', ARRAY['plastic'], 'red', 'Launches marbles with spring-loaded mechanism for dramatic acceleration.', 'Requires specific track alignment for proper marble trajectory.'),
-- Marble Genius pieces
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Wooden Straight Chute', 'wooden-straight-chute', 'track', 'straight', '{"length": 300, "width": 40, "height": 20}', ARRAY['wood'], 'natural', 'Smooth wooden chute that provides steady marble flow with natural wood grain.', 'Standard 40mm width compatible with most wooden marble run systems.'),
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Spiral Funnel', 'spiral-funnel', 'track', 'spiral', '{"diameter": 120, "height": 80}', ARRAY['wood'], 'natural', 'Wooden spiral that creates mesmerizing marble motion as balls circle downward.', 'Requires sturdy support due to weight and marble momentum.')
ON CONFLICT (brand_id, slug) DO NOTHING;
```

## Step 5: Configure Vercel Environment Variables

Now add your environment variables to Vercel:

1. Go to your Vercel dashboard
2. Select the `gravityplay` project  
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://lckljiicdebhdszeipkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxja2xqaWljZGViaGRzemVpcGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjM2MTIsImV4cCI6MjA3MDQzOTYxMn0.AiJfo4f4x4PrzeYEWjFMFXaNAc-QZWLN1tVz1LIGRlE
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxja2xqaWljZGViaGRzemVpcGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg2MzYxMiwiZXhwIjoyMDcwNDM5NjEyfQ.ZOonvXf-u9yS1kMjJWuuEwri5GelGBjygq4TTCpE7f8
NEXT_PUBLIC_APP_URL = https://gravityplay.fun
```

5. **Redeploy** the project to apply the environment variables

## That's It! 🎉

Your GravityPlay platform will now have:
- Complete database schema with 6 tables
- Sample marble run brands and pieces  
- Security policies for user data protection
- Full authentication system ready to use
- Production deployment at gravityplay.fun

You can test by visiting your deployed site and trying to register/login!