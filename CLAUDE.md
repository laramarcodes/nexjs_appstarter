# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run clean` - Run both lint:fix and format:write

### Convex Backend
- `npm run convex:dev` - Start Convex in development mode (run alongside `npm run dev`)
- `npm run convex:deploy` - Deploy Convex functions to production
- `npx convex init` - Initialize a new Convex project
- `npx convex dashboard` - Open Convex dashboard in browser

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright e2e tests

### Shadcn UI Components
- `npx shadcn@latest add [component-name]` - Install new Shadcn UI components

## Architecture

This is a Next.js 15 SaaS template using the App Router with clear separation between authenticated and unauthenticated routes.

### Route Structure
- `/app/(unauthenticated)` - Public routes
  - `(marketing)` - Landing pages, pricing, features
  - `(auth)` - Login and signup flows
- `/app/(authenticated)` - Protected routes requiring Clerk auth
  - `dashboard` - Main application with account, billing, support sections
- `/app/api` - API routes including Stripe webhook handler

### Key Patterns
- **Server Actions** in `/actions` for data mutations (customers, Stripe operations)
- **Convex Backend** in `/convex` for real-time database and serverless functions
- **UI Components** in `/components/ui` from Shadcn UI library
- **Authentication** handled by Clerk middleware with Convex integration
- **Payments** integrated via Stripe with Convex HTTP actions for webhooks

### Data Flow
1. Authentication state managed by Clerk with Convex integration
2. Customer data stored in Convex with real-time reactivity
3. Stripe webhooks handled by Convex HTTP actions
4. Server actions use Convex client for data operations

### Environment Variables Required
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment identifier
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain for Convex auth
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY` - Stripe yearly payment link
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY` - Stripe monthly payment link