# Contributing to GravityPlay

## Development Workflow

### Setup
1. Fork and clone the repository
2. Copy `.env.example` to `.env.local` and configure
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server

### Branch Strategy
- `main` - production ready code
- `develop` - integration branch  
- `feature/*` - individual features
- `hotfix/*` - urgent production fixes

### Commit Messages
Use conventional commits:
- `feat:` new features
- `fix:` bug fixes  
- `docs:` documentation updates
- `style:` formatting changes
- `refactor:` code restructuring
- `test:` test additions
- `chore:` maintenance tasks

## Code Standards

### TypeScript
- Strict mode enabled - no `any` types allowed
- Proper type definitions for all props and functions
- Use branded types for IDs and sensitive data

### React Components
- Functional components only
- React Server Components where possible
- Proper prop typing with TypeScript interfaces

### Styling
- Tailwind CSS for all styling
- Mobile-first responsive design
- Consistent spacing and color usage

### Testing
- Unit tests for utilities and hooks
- Component tests for UI components  
- Integration tests for API routes
- 90%+ test coverage required

## Quality Checks

### Before Submitting PR
- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Performance meets standards (Lighthouse > 90)
- [ ] Accessibility standards met (WCAG AA)

### Performance Requirements
- Core Web Vitals in "Good" range
- Database queries < 100ms response time
- Image optimization using Next.js Image component

## Security Guidelines

### Authentication
- Always use Supabase Auth helpers
- Never store sensitive data in client state
- Implement proper session management

### Data Validation
- Validate all inputs with Zod schemas
- Server-side validation for all API endpoints
- Sanitize user-generated content

### File Uploads
- Validate file types and sizes
- Use Supabase Storage for secure uploads
- Implement proper access controls

## Architecture Decisions

### When to Use Server Components
- Static content that doesn't require interactivity
- Data fetching that can be done at build time
- SEO-critical pages

### When to Use Client Components
- Interactive features (forms, buttons, modals)
- State management requirements
- Browser API access

### Database Queries
- Use Supabase client for data fetching
- Implement proper error handling
- Use RLS policies for security

## Documentation

### Code Documentation
- Document complex business logic
- Include JSDoc comments for public APIs
- Maintain up-to-date README instructions

### API Documentation
- Document all endpoint parameters
- Include example requests and responses
- Maintain Swagger/OpenAPI specs

## Getting Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Contact
- Create GitHub issues for bugs and feature requests
- Use GitHub Discussions for questions and ideas
- Follow the issue templates provided