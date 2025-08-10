-- Sample data for development and testing
-- This file should be run after the initial schema migration

-- Insert sample brands
INSERT INTO brands (name, slug, description, website_url, country, founded_year) VALUES
('Gravitrax', 'gravitrax', 'The interactive track system by Ravensburger that combines creativity, engineering, and gravity to create endless possibilities.', 'https://www.gravitrax.com', 'DE', 2017),
('Marble Genius', 'marble-genius', 'Premium wooden marble run sets designed for both children and adults who love hands-on building experiences.', 'https://www.marblegenius.com', 'US', 2015),
('Hubelino', 'hubelino', 'Compatible marble run system that works with DUPLO bricks, combining the best of both construction worlds.', 'https://www.hubelino.com', 'DE', 2009),
('Quadrilla', 'quadrilla', 'Hape''s award-winning wooden marble run system featuring colorful blocks and innovative acceleration elements.', 'https://www.hape.com', 'DE', 1986),
('Marble Run', 'marble-run', 'Classic wooden marble run sets featuring traditional craftsmanship and timeless design principles.', null, 'US', 1995);

-- Insert sample product sets
INSERT INTO product_sets (brand_id, name, slug, description, set_number, release_year, age_range_min, age_range_max, piece_count, msrp_usd) VALUES
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'GraviTrax Starter Set', 'gravitrax-starter-set', 'The perfect entry point into the GraviTrax universe with essential track pieces and action elements.', '27590', 2017, 8, 99, 122, 59.99),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'GraviTrax XXL Starter Set', 'gravitrax-xxl-starter-set', 'Expanded starter set with more pieces and additional action elements for complex builds.', '27494', 2019, 8, 99, 226, 99.99),
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Marble Genius Extreme Set', 'marble-genius-extreme-set', 'Our largest wooden marble run with 85 pieces including curves, spirals, and multiple drop zones.', 'MG-EX85', 2020, 6, 99, 85, 129.99),
((SELECT id FROM brands WHERE slug = 'hubelino'), 'Hubelino Mega Building Set', 'hubelino-mega-building-set', 'Comprehensive set compatible with DUPLO featuring tunnels, curves, and speed elements.', '420473', 2018, 4, 10, 128, 89.99),
((SELECT id FROM brands WHERE slug = 'quadrilla'), 'Quadrilla Wooden Marble Run', 'quadrilla-wooden-marble-run', 'Beautifully crafted wooden marble run with colored blocks that create different marble paths.', 'E6009', 2016, 4, 99, 97, 149.99);

-- Insert sample piece types
INSERT INTO piece_types (brand_id, name, slug, category, subcategory, dimensions, materials, color, description, compatibility_notes) VALUES
-- GraviTrax pieces
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Straight Track', 'straight-track', 'track', 'straight', '{"length": 96, "width": 48, "height": 8}', ARRAY['plastic'], 'gray', 'Basic straight track piece that forms the foundation of any GraviTrax build.', 'Compatible with all GraviTrax track pieces via magnetic connections.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Curved Track', 'curved-track', 'track', 'curved', '{"length": 96, "width": 96, "height": 8}', ARRAY['plastic'], 'gray', '90-degree curved track piece for creating turns and loops in your marble path.', 'Magnetic connections compatible with all GraviTrax track system.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Height Tile', 'height-tile', 'support', 'elevation', '{"length": 96, "width": 48, "height": 21}', ARRAY['plastic'], 'gray', 'Foundation tile that elevates track pieces to create multi-level builds.', 'Essential for creating height differences in GraviTrax systems.'),
((SELECT id FROM brands WHERE slug = 'gravitrax'), 'Cannon', 'cannon', 'special', 'launcher', '{"length": 96, "width": 48, "height": 35}', ARRAY['plastic'], 'red', 'Launches marbles with spring-loaded mechanism for dramatic acceleration.', 'Requires specific track alignment for proper marble trajectory.'),

-- Marble Genius pieces
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Wooden Straight Chute', 'wooden-straight-chute', 'track', 'straight', '{"length": 300, "width": 40, "height": 20}', ARRAY['wood'], 'natural', 'Smooth wooden chute that provides steady marble flow with natural wood grain.', 'Standard 40mm width compatible with most wooden marble run systems.'),
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Spiral Funnel', 'spiral-funnel', 'track', 'spiral', '{"diameter": 120, "height": 80}', ARRAY['wood'], 'natural', 'Wooden spiral that creates mesmerizing marble motion as balls circle downward.', 'Requires sturdy support due to weight and marble momentum.'),
((SELECT id FROM brands WHERE slug = 'marble-genius'), 'Support Post', 'support-post', 'support', 'vertical', '{"diameter": 25, "height": 200}', ARRAY['wood'], 'natural', 'Solid wooden post that provides stable vertical support for elevated track sections.', 'Standard diameter fits most wooden marble run connection systems.'),

-- Hubelino pieces
((SELECT id FROM brands WHERE slug = 'hubelino'), 'DUPLO-Compatible Base', 'duplo-compatible-base', 'support', 'foundation', '{"length": 64, "width": 32, "height": 19}', ARRAY['plastic'], 'blue', 'Foundation piece with DUPLO-compatible studs for secure building platform.', 'Direct compatibility with all DUPLO brick systems and Hubelino tracks.'),
((SELECT id FROM brands WHERE slug = 'hubelino'), 'Marble Tunnel', 'marble-tunnel', 'track', 'tunnel', '{"length": 96, "width": 32, "height": 32}', ARRAY['plastic'], 'green', 'Enclosed tunnel section that guides marbles while hiding their path for surprise reveals.', 'Connects seamlessly with other Hubelino track pieces via standardized ports.'),

-- Quadrilla pieces  
((SELECT id FROM brands WHERE slug = 'quadrilla'), 'Acceleration Block', 'acceleration-block', 'special', 'accelerator', '{"length": 50, "width": 50, "height": 50}', ARRAY['wood'], 'red', 'Special wooden block with internal mechanism that speeds up marble movement.', 'Color-coded red indicates acceleration function in Quadrilla system.'),
((SELECT id FROM brands WHERE slug = 'quadrilla'), 'Direction Block', 'direction-block', 'connector', 'junction', '{"length": 50, "width": 50, "height": 50}', ARRAY['wood'], 'blue', 'Multi-directional wooden block that can route marbles in different paths based on entry point.', 'Blue color indicates directional change capability in Quadrilla color system.');

-- Insert sample piece photos (URLs would be actual image URLs in production)
INSERT INTO piece_photos (piece_type_id, url, alt_text, angle, is_primary, sort_order) VALUES
((SELECT id FROM piece_types WHERE slug = 'straight-track'), '/images/pieces/gravitrax-straight-track-front.jpg', 'GraviTrax straight track piece front view', 'front', true, 1),
((SELECT id FROM piece_types WHERE slug = 'straight-track'), '/images/pieces/gravitrax-straight-track-side.jpg', 'GraviTrax straight track piece side profile', 'side', false, 2),
((SELECT id FROM piece_types WHERE slug = 'curved-track'), '/images/pieces/gravitrax-curved-track-front.jpg', 'GraviTrax curved track piece showing 90-degree bend', 'front', true, 1),
((SELECT id FROM piece_types WHERE slug = 'cannon'), '/images/pieces/gravitrax-cannon-detail.jpg', 'GraviTrax cannon mechanism detail view', 'detail', true, 1),
((SELECT id FROM piece_types WHERE slug = 'wooden-straight-chute'), '/images/pieces/marble-genius-chute-front.jpg', 'Wooden straight chute natural finish', 'front', true, 1),
((SELECT id FROM piece_types WHERE slug = 'spiral-funnel'), '/images/pieces/marble-genius-spiral-top.jpg', 'Spiral funnel viewed from above showing marble path', 'top', true, 1);

-- Insert sample piece compatibility data
INSERT INTO piece_compatibility (piece1_id, piece2_id, compatibility_type, confidence_score, notes) VALUES
-- GraviTrax internal compatibility
((SELECT id FROM piece_types WHERE slug = 'straight-track'), 
 (SELECT id FROM piece_types WHERE slug = 'curved-track'), 
 'direct', 1.0, 'Perfect magnetic connection - core GraviTrax system compatibility.'),
 
((SELECT id FROM piece_types WHERE slug = 'straight-track'), 
 (SELECT id FROM piece_types WHERE slug = 'height-tile'), 
 'direct', 1.0, 'Height tiles designed specifically to support GraviTrax tracks.'),

-- Cross-brand compatibility examples
((SELECT id FROM piece_types WHERE slug = 'duplo-compatible-base'), 
 (SELECT id FROM piece_types WHERE slug = 'marble-tunnel'), 
 'direct', 1.0, 'Both Hubelino pieces designed for seamless integration.'),

-- Incompatible examples
((SELECT id FROM piece_types WHERE slug = 'straight-track'), 
 (SELECT id FROM piece_types WHERE slug = 'wooden-straight-chute'), 
 'incompatible', 0.9, 'Different connection systems: magnetic vs wooden groove. Size mismatch prevents direct connection.'),

((SELECT id FROM piece_types WHERE slug = 'cannon'), 
 (SELECT id FROM piece_types WHERE slug = 'spiral-funnel'), 
 'incompatible', 0.8, 'Cannon requires specific track alignment that wooden spiral cannot provide due to different mounting systems.');