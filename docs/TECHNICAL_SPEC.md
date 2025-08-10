# Technical Specifications - GravityPlay

## Database Schema

### Core Tables

#### brands
```sql
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
```

#### product_sets
```sql
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
```

#### piece_types
```sql
CREATE TABLE piece_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  category VARCHAR NOT NULL, -- track, support, connector, special
  subcategory VARCHAR,
  dimensions JSONB, -- {length, width, height, diameter}
  materials TEXT[],
  color VARCHAR,
  description TEXT,
  compatibility_notes TEXT,
  brand_specific_data JSONB, -- extensible brand-specific attributes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);
```

#### piece_photos
```sql
CREATE TABLE piece_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  angle VARCHAR, -- front, back, side, top, bottom, detail
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID, -- references auth.users
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### piece_compatibility
```sql
CREATE TABLE piece_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece1_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  piece2_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  compatibility_type VARCHAR NOT NULL, -- direct, adapter_required, incompatible
  adapter_piece_id UUID REFERENCES piece_types(id), -- if adapter required
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0-1.0
  verified_by UUID, -- references auth.users
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(piece1_id, piece2_id)
);
```

#### user_collections
```sql
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- references auth.users
  piece_type_id UUID REFERENCES piece_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  condition VARCHAR DEFAULT 'good', -- new, good, fair, poor
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  notes TEXT,
  is_wishlist BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, piece_type_id, is_wishlist)
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_product_sets_brand_slug ON product_sets(brand_id, slug);
CREATE INDEX idx_piece_types_brand_category ON piece_types(brand_id, category);
CREATE INDEX idx_piece_photos_piece_primary ON piece_photos(piece_type_id, is_primary);
CREATE INDEX idx_compatibility_pieces ON piece_compatibility(piece1_id, piece2_id);
CREATE INDEX idx_user_collections_user ON user_collections(user_id, is_wishlist);

-- Search indexes
CREATE INDEX idx_brands_name_gin ON brands USING gin(to_tsvector('english', name));
CREATE INDEX idx_piece_types_name_gin ON piece_types USING gin(to_tsvector('english', name || ' ' || description));
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all user data tables
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Users can only access their own collection data
CREATE POLICY user_collections_policy ON user_collections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read access to catalog data
CREATE POLICY public_read_brands ON brands FOR SELECT TO public USING (is_active = true);
CREATE POLICY public_read_sets ON product_sets FOR SELECT TO public USING (is_active = true);
CREATE POLICY public_read_pieces ON piece_types FOR SELECT TO public USING (is_active = true);
CREATE POLICY public_read_photos ON piece_photos FOR SELECT TO public USING (true);
CREATE POLICY public_read_compatibility ON piece_compatibility FOR SELECT TO public USING (true);
```

## API Architecture

### Authentication
- Supabase Auth with email/password and OAuth providers
- JWT tokens for session management
- Row Level Security for data access control

### API Routes Structure
```
/api/
├── auth/
│   ├── login
│   ├── logout
│   ├── signup
│   └── callback
├── catalog/
│   ├── brands
│   ├── sets
│   ├── pieces
│   └── compatibility
├── collections/
│   ├── my-pieces
│   ├── wishlist
│   └── stats
├── admin/
│   ├── brands
│   ├── sets
│   ├── pieces
│   └── users
└── upload/
    ├── photos
    └── validate
```

## Frontend Architecture

### Component Structure
- **UI Components**: Reusable, accessible components using Radix UI
- **Form Components**: React Hook Form with Zod validation
- **Catalog Components**: Product display and filtering
- **Admin Components**: Management interfaces with proper permissions
- **Layout Components**: Navigation, headers, footers

### State Management
- React Context for authentication state
- Server components for data fetching where possible
- Client components only when interactivity is required

### Performance Optimizations
- Next.js Image optimization for piece photography
- Static generation for catalog pages
- Database query optimization with proper indexes
- Caching strategies for frequently accessed data

## Security Requirements

### Input Validation
- Zod schemas for all form inputs
- Server-side validation for all API endpoints
- File upload validation (type, size, dimensions)

### Authentication & Authorization
- Supabase Auth with secure session management
- Role-based access control (admin, user, anonymous)
- Rate limiting on authentication endpoints

### Data Protection
- Row Level Security on all user data
- Environment variables for all secrets
- Secure file upload to Supabase Storage

## Performance Standards

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Database Performance
- Query response times < 100ms
- Proper indexing on all frequently queried columns
- Connection pooling and query optimization

### Image Optimization
- WebP format with fallbacks
- Responsive images with proper sizing
- Lazy loading for off-screen content