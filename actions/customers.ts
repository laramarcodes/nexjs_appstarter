"use server"

import { convex } from "@/lib/convex"
import { api } from "@/convex/_generated/api"
import { currentUser } from "@clerk/nextjs/server"
import { Id } from "@/convex/_generated/dataModel"

export type Customer = {
  _id: Id<"customers">
  _creationTime: number
  userId: string
  membership: "free" | "pro"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export async function getCustomerByUserId(
  userId: string
): Promise<Customer | null> {
  const customer = await convex.query(api.customers.getByUserId, { userId })
  return customer
}

export async function getBillingDataByUserId(userId: string): Promise<{
  customer: Customer | null
  clerkEmail: string | null
  stripeEmail: string | null
}> {
  // Get Clerk user data
  const user = await currentUser()

  // Get profile to fetch Stripe customer ID
  const customer = await convex.query(api.customers.getByUserId, { userId })

  // Get Stripe email if it exists
  const stripeEmail = customer?.stripeCustomerId
    ? user?.emailAddresses[0]?.emailAddress || null
    : null

  return {
    customer: customer || null,
    clerkEmail: user?.emailAddresses[0]?.emailAddress || null,
    stripeEmail
  }
}

export async function createCustomer(
  userId: string
): Promise<{ isSuccess: boolean; data?: Customer }> {
  try {
    const customerId = await convex.mutation(api.customers.create, {
      userId,
      membership: "free"
    })

    // Fetch the created customer
    const newCustomer = await convex.query(api.customers.getByUserId, { userId })

    if (!newCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: newCustomer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { isSuccess: false }
  }
}

export async function updateCustomerByUserId(
  userId: string,
  updates: {
    membership?: "free" | "pro"
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
): Promise<{ isSuccess: boolean; data?: Customer }> {
  try {
    const updatedCustomer = await convex.mutation(api.customers.updateByUserId, {
      userId,
      ...updates
    })

    return { isSuccess: true, data: updatedCustomer }
  } catch (error) {
    console.error("Error updating customer by userId:", error)
    return { isSuccess: false }
  }
}

export async function updateCustomerByStripeCustomerId(
  stripeCustomerId: string,
  updates: {
    membership?: "free" | "pro"
    stripeSubscriptionId?: string
  }
): Promise<{ isSuccess: boolean; data?: Customer }> {
  try {
    // Note: This function is not used anymore since we handle Stripe updates 
    // directly in the Convex HTTP action. Keeping it for compatibility.
    const customer = await convex.query(api.customers.getByStripeCustomerId, { 
      stripeCustomerId 
    })
    
    if (!customer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: customer }
  } catch (error) {
    console.error("Error updating customer by stripeCustomerId:", error)
    return { isSuccess: false }
  }
}
