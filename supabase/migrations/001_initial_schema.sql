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