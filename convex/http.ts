import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  appInfo: {
    name: "Mckay's App Template",
    version: "0.1.0"
  }
});

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted"
]);

// Stripe webhook endpoint
http.route({
  path: "/stripe/webhooks",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();
    const sig = req.headers.get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) {
        throw new Error("Webhook secret or signature missing");
      }

      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error(
        `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      return new Response(
        JSON.stringify({
          error: err instanceof Error ? err.message : "Unknown error"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            await handleSubscriptionChange(ctx, event);
            break;

          case "checkout.session.completed":
            await handleCheckoutSession(ctx, event);
            break;

          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.error("Webhook handler failed:", error);
        return new Response(
          JSON.stringify({
            error: "Webhook handler failed. View your function logs."
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }),
});

async function handleSubscriptionChange(ctx: any, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const productId = subscription.items.data[0].price.product as string;
  
  // Get product details to check membership
  const product = await stripe.products.retrieve(productId);
  const membership = product.metadata?.membership;
  
  if (!membership || !["free", "pro"].includes(membership)) {
    throw new Error(
      `Invalid or missing membership type in product metadata: ${membership}`
    );
  }

  // Determine membership status based on subscription status
  const membershipStatus = getMembershipStatus(
    subscription.status,
    membership as "free" | "pro"
  );

  // Update customer in Convex
  await ctx.runMutation(internal.customers.internalUpdateByStripeCustomerId, {
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    membership: membershipStatus
  });
}

async function handleCheckoutSession(ctx: any, event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  
  if (checkoutSession.mode === "subscription") {
    const subscriptionId = checkoutSession.subscription as string;
    const clientReferenceId = checkoutSession.client_reference_id;
    const customerId = checkoutSession.customer as string;

    if (!clientReferenceId) {
      throw new Error(
        "client_reference_id is required for subscription checkout"
      );
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"]
    });

    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);
    const membership = product.metadata?.membership;

    if (!membership || !["free", "pro"].includes(membership)) {
      throw new Error(
        `Invalid or missing membership type in product metadata: ${membership}`
      );
    }

    // Determine membership status
    const membershipStatus = getMembershipStatus(
      subscription.status,
      membership as "free" | "pro"
    );

    // Link Stripe customer to user in Convex
    await ctx.runMutation(internal.customers.internalLinkStripeCustomer, {
      userId: clientReferenceId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      membership: membershipStatus
    });
  }
}

function getMembershipStatus(
  status: Stripe.Subscription.Status,
  membership: "free" | "pro"
): "free" | "pro" {
  switch (status) {
    case "active":
    case "trialing":
      return membership;
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free";
    default:
      return "free";
  }
}

export default http;