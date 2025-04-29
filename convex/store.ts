import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
// import { Doc, Id } from "./_generated/dataModel";

// Make the query public
export const listItems = query({
  args: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handler: async (ctx: GenericQueryCtx<any>) => {
    return await ctx.db.query("storeItems").collect();
  },
});

// Make the mutation public
export const purchaseBackground = mutation({
  args: {
    imageUrl: v.union(v.string(), v.null()),
  },
  handler: async (
    ctx: GenericMutationCtx<any>,
    args: { imageUrl: string | null },
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    if (args.imageUrl === null) {
      // Switch to default background (no background)
      await ctx.db.patch(profile._id, {
        selectedBackground: undefined,
      });
      return { success: true };
    }

    // Get current purchased backgrounds or initialize empty array
    const purchasedBackgrounds = profile.purchasedBackgrounds || [];

    // Check if already purchased first
    if (purchasedBackgrounds.includes(args.imageUrl)) {
      // If already purchased, just set it as selected without charging
      await ctx.db.patch(profile._id, {
        selectedBackground: args.imageUrl,
      });
      return { success: true };
    }

    // Only check apple count if we need to purchase
    if (profile.score === undefined || profile.score < 5) {
      throw new Error(
        "Not enough apples! You need 5 apples to purchase a background.",
      );
    }

    // Update profile with new background, deduct apples, and add to purchased list
    await ctx.db.patch(profile._id, {
      score: profile.score - 5,
      selectedBackground: args.imageUrl,
      purchasedBackgrounds: [...purchasedBackgrounds, args.imageUrl],
    });

    return { success: true };
  },
});

// Initialize store items
export const initializeStore = mutation({
  args: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handler: async (ctx: GenericMutationCtx<any>) => {
    const items = [
      {
        name: "Chapman Background",
        description: "Show your Chapman pride!",
        price: 5,
        imageUrl: "/chapmanBG.png",
        type: "background",
      },
      {
        name: "Hospital Background",
        description: "Medical vibes!",
        price: 5,
        imageUrl: "/hospitalBG.png",
        type: "background",
      },
      {
        name: "Kyle Kuzma Background",
        description: "NBA Star Power!",
        price: 5,
        imageUrl: "/kuzBG.png",
        type: "background",
      },
    ];

    // Check for existing items by imageUrl
    for (const item of items) {
      const existing = await ctx.db
        .query("storeItems")
        .filter((q) => q.eq(q.field("imageUrl"), item.imageUrl))
        .unique();

      // Only insert if the item doesn't exist
      if (!existing) {
        await ctx.db.insert("storeItems", item);
      }
    }
  },
});
