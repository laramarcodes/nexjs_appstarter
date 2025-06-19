# Mckay's App Template

This is a full-stack app template that I use to build my own apps.

To learn how to use this template with the best AI tools & workflows, check out my workshops on [Takeoff](https://JoinTakeoff.com/)!

## Tech Stack

- Frontend: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs/guides/nextjs), [Shadcn](https://ui.shadcn.com/docs/installation), [Framer Motion](https://www.framer.com/motion/introduction/)
- Backend: [Convex](https://convex.dev/) (Real-time database and serverless functions), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Auth: [Clerk](https://clerk.com/) with Convex integration
- Payments: [Stripe](https://stripe.com/) with Convex HTTP actions

## Prerequisites

You will need accounts for the following services.

They all have free plans that you can use to get started.

- Create a [GitHub](https://github.com/) account
- Create a [Convex](https://convex.dev/) account
- Create a [Clerk](https://clerk.com/) account
- Create a [Stripe](https://stripe.com/) account
- Create a [Vercel](https://vercel.com/) account

You will likely not need paid plans unless you are building a business.

## Environment Variables

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=
```

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the environment variables from above
3. Run `npm install` to install dependencies
4. Run `npx convex init` to initialize your Convex project
5. Configure Clerk authentication in Convex:
   - In your Clerk dashboard, find the JWT issuer domain
   - Add it to your `.env.local` as `CLERK_JWT_ISSUER_DOMAIN`
6. Run `npm run convex:dev` in one terminal to start Convex
7. Run `npm run dev` in another terminal to start the Next.js app
8. Configure your Stripe webhook endpoint:
   - In Stripe dashboard, set webhook endpoint to: `https://your-project.convex.site/stripe/webhooks`
   - Add the webhook secret to your `.env.local`
