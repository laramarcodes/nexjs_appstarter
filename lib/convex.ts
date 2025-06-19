import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for server-side use
export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);