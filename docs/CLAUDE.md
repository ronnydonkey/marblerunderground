# CLAUDE.md - Development Guidelines for Marble Runderground

## Project Overview

**Marble Runderground** is the ultimate platform for marble run enthusiasts. We've completed **Phase 1** (foundation infrastructure) and are now entering **Phase 2** (feature development and community building).

### Phase 1 Completed ✅
- Complete Next.js 14 + TypeScript + Tailwind CSS foundation
- Supabase backend with authentication and database schema
- Row Level Security (RLS) policies 
- Security hardening (rate limiting, CSP, input validation)
- Basic catalog browsing and authentication flows
- Deployment pipeline and CI/CD

## Phase 2 Development Roadmap

### High Priority Features (Weeks 1-4)

#### 1. Advanced Catalog Features
- **Search & Filtering**: Implement full-text search across pieces, brands, sets
- **Compatibility Matrix**: Interactive piece compatibility checker
- **Advanced Filtering**: By brand, category, price range, age group
- **Piece Recommendations**: Suggest compatible pieces based on user's collection

#### 2. User Collection Management  
- **My Collection**: Track owned pieces with quantities and condition
- **Wishlist**: Save desired pieces for future purchase
- **Collection Analytics**: Statistics and insights about user's collection
- **Import/Export**: CSV import for bulk collection management

#### 3. Community Features Foundation
- **User Profiles**: Public profiles with collection highlights
- **Basic Reviews**: Piece and set reviews with ratings
- **Photo Sharing**: Users can upload photos of their pieces/builds

### Medium Priority Features (Weeks 5-8)

#### 4. Build Gallery & Instructions
- **Build Gallery**: Showcase community marble run builds
- **Step-by-Step Instructions**: Photo-based build tutorials
- **Build Difficulty Ratings**: Rate complexity of builds
- **Parts Lists**: Required pieces for each build

#### 5. Enhanced Mobile Experience
- **Progressive Web App (PWA)**: Offline catalog browsing
- **Mobile-Optimized Interactions**: Touch-friendly piece comparison
- **Image Gallery**: Swipe-based photo browsing

#### 6. Comprehensive Testing Suite
- **Unit Tests**: All utilities and hooks (Jest)
- **Integration Tests**: API routes and authentication flows
- **Component Tests**: UI component testing with React Testing Library
- **E2E Tests**: Critical user journeys with Playwright

### Lower Priority Features (Weeks 9-12)

#### 7. Advanced Community Features
- **Discussion Forums**: Brand and technique discussions
- **User Following**: Follow favorite builders and collectors
- **Achievement System**: Badges for collection milestones
- **Market Integration**: Price tracking and purchase links

## Development Standards

### Code Organization
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── ui/             # Base UI components (buttons, inputs)
│   ├── catalog/        # Catalog-specific components
│   ├── forms/          # Form components with validation
│   └── layout/         # Layout components (header, footer)
├── lib/                # Utility libraries
│   ├── hooks/          # Custom React hooks
│   ├── supabase/       # Database client configuration
│   ├── security/       # Security utilities and validation
│   ├── types/          # TypeScript type definitions
│   └── validations/    # Zod schemas for input validation
└── middleware.ts       # Request middleware (auth, rate limiting)
```

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode, no `any` types)
- **Styling**: Tailwind CSS with mobile-first approach
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with enhanced validation
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Testing**: Jest + React Testing Library + Playwright

### Security Requirements
- ✅ **Rate Limiting**: 100 requests/15min (5 for auth endpoints)
- ✅ **Input Validation**: All user inputs sanitized with Zod schemas  
- ✅ **Content Security Policy**: Strict CSP headers implemented
- ✅ **Authentication**: Session-based auth with RLS policies
- ⚠️ **API Keys**: Must regenerate all Supabase keys after security incident

### Database Schema Key Tables
- `brands`: Marble run manufacturers (GraviTrax, Hubelino, etc.)
- `product_sets`: Complete sets with piece counts and MSRP
- `piece_types`: Individual piece types with compatibility data
- `piece_compatibility`: Cross-brand compatibility matrix  
- `user_collections`: User's owned pieces with quantities
- `piece_photos`: High-quality piece photography with metadata

### Performance Standards
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Database**: Query response times < 100ms
- **Images**: Next.js Image component with WebP/AVIF optimization
- **Caching**: Static generation for catalog pages

## Claude Development Guidelines

### When Working on Features
1. **Always start with security**: Validate all inputs, sanitize data
2. **Mobile-first design**: Build responsive components from the start
3. **Test as you go**: Write tests alongside feature development
4. **Follow existing patterns**: Mimic established code conventions
5. **Performance conscious**: Optimize images, minimize client-side JS

### Before Committing Code
- [ ] Run `npm run type-check` (no TypeScript errors)
- [ ] Run `npm run lint` (no linting errors)  
- [ ] Run `npm run test` (all tests passing)
- [ ] Test responsive design on mobile viewport
- [ ] Verify accessibility with screen readers

### Database Interactions
- Always use Supabase client helpers
- Leverage RLS policies instead of manual authorization
- Use proper TypeScript types for database responses
- Handle errors gracefully with user-friendly messages

### Component Development
- Prefer Server Components for static content
- Use Client Components only for interactivity
- Implement proper loading and error states
- Follow Radix UI patterns for accessibility

## Phase 2 Success Metrics

### Technical Metrics
- **90%+ test coverage** across all new features
- **Zero TypeScript errors** in production builds
- **Lighthouse scores > 90** for performance, accessibility, SEO
- **Sub-100ms database query times** for all catalog operations

### User Experience Metrics  
- **Comprehensive piece database** with 500+ piece types across major brands
- **Working compatibility matrix** for cross-brand piece compatibility
- **User collection management** with import/export capabilities
- **Mobile-optimized experience** with PWA capabilities

### Community Engagement
- **User-generated content** through build gallery and reviews
- **Active community features** with profiles and photo sharing
- **Comprehensive build instructions** with step-by-step guides

## Getting Started with Phase 2

1. **Review completed security hardening** in `/src/middleware.ts` and `/src/lib/security/`
2. **Examine database schema** in `/supabase/migrations/` to understand data model
3. **Study existing components** in `/src/components/` to understand patterns
4. **Start with catalog enhancements** as they build on existing foundation
5. **Use this roadmap** to prioritize features and maintain focus

## Contact & Support

- **Technical Questions**: Reference this CLAUDE.md and `/docs/TECHNICAL_SPEC.md`
- **Security Concerns**: See `/docs/SECURITY.md` for incident response
- **Contributing**: Follow guidelines in `/docs/CONTRIBUTING.md`

---

*Updated: Phase 2 Launch - January 2025*
*Next Review: End of Phase 2 Development*