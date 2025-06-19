import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query to get customer by userId
export const getByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("customers"),
      _creationTime: v.number(),
      userId: v.string(),
      membership: v.union(v.literal("free"), v.literal("pro")),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    
    return customer;
  },
});

// Query to get customer by stripeCustomerId
export const getByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("customers"),
      _creationTime: v.number(),
      userId: v.string(),
      membership: v.union(v.literal("free"), v.literal("pro")),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_stripe_customer_id", (q) => 
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
    
    return customer;
  },
});

// Internal query to get customer by stripeCustomerId (for internal use)
export const internalGetByStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("customers"),
      _creationTime: v.number(),
      userId: v.string(),
      membership: v.union(v.literal("free"), v.literal("pro")),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_stripe_customer_id", (q) => 
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
    
    return customer;
  },
});

// Mutation to create a new customer
export const create = mutation({
  args: { 
    userId: v.string(),
    membership: v.optional(v.union(v.literal("free"), v.literal("pro")))
  },
  returns: v.id("customers"),
  handler: async (ctx, args) => {
    // Check if customer already exists
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (existing) {
      throw new Error("Customer already exists");
    }

    const customerId = await ctx.db.insert("customers", {
      userId: args.userId,
      membership: args.membership || "free",
    });

    return customerId;
  },
});

// Mutation to update customer by userId
export const updateByUserId = mutation({
  args: { 
    userId: v.string(),
    membership: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("customers"),
    _creationTime: v.number(),
    userId: v.string(),
    membership: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!customer) {
      throw new Error("Customer not found");
    }

    const updates: Partial<Doc<"customers">> = {};
    if (args.membership !== undefined) updates.membership = args.membership;
    if (args.stripeCustomerId !== undefined) updates.stripeCustomerId = args.stripeCustomerId;
    if (args.stripeSubscriptionId !== undefined) updates.stripeSubscriptionId = args.stripeSubscriptionId;

    await ctx.db.patch(customer._id, updates);
    
    return { ...customer, ...updates };
  },
});

// Internal mutation to update customer by stripeCustomerId (for webhook use)
export const internalUpdateByStripeCustomerId = internalMutation({
  args: { 
    stripeCustomerId: v.string(),
    membership: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    stripeSubscriptionId: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("customers"),
    _creationTime: v.number(),
    userId: v.string(),
    membership: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_stripe_customer_id", (q) => 
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
    
    if (!customer) {
      throw new Error("Customer not found");
    }

    const updates: Partial<Doc<"customers">> = {};
    if (args.membership !== undefined) updates.membership = args.membership;
    if (args.stripeSubscriptionId !== undefined) updates.stripeSubscriptionId = args.stripeSubscriptionId;

    await ctx.db.patch(customer._id, updates);
    
    return { ...customer, ...updates };
  },
});

// Internal mutation to link Stripe customer ID to a user (for webhook use)
export const internalLinkStripeCustomer = internalMutation({
  args: { 
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    membership: v.optional(v.union(v.literal("free"), v.literal("pro"))),
  },
  returns: v.object({
    _id: v.id("customers"),
    _creationTime: v.number(),
    userId: v.string(),
    membership: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // First try to find by userId
    let customer = await ctx.db
      .query("customers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (customer) {
      // Update existing customer
      const updates: Partial<Doc<"customers">> = {
        stripeCustomerId: args.stripeCustomerId,
      };
      if (args.stripeSubscriptionId !== undefined) updates.stripeSubscriptionId = args.stripeSubscriptionId;
      if (args.membership !== undefined) updates.membership = args.membership;

      await ctx.db.patch(customer._id, updates);
      return { ...customer, ...updates };
    } else {
      // Create new customer
      const customerId = await ctx.db.insert("customers", {
        userId: args.userId,
        membership: args.membership || "free",
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
      });
      
      const newCustomer = await ctx.db.get(customerId);
      return newCustomer!;
    }
  },
});