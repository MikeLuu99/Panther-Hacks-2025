import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const create = mutation({
  args: {
    nickname: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) throw new Error("Profile already exists");

    // Save to profiles table with initial score of 0
    await ctx.db.insert("profiles", {
      userId,
      nickname: args.nickname,
      score: 0,
    });

    // Update the user's name in the users table
    await ctx.db.patch(userId, {
      name: args.nickname,
    });
  },
});

// Migration: Initialize scores for existing profiles
export const initializeScores = mutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();

    for (const profile of profiles) {
      if (profile.score === undefined) {
        // Count completed tasks for this user
        const completions = await ctx.db
          .query("taskCompletions")
          .filter((q) => q.eq(q.field("userId"), profile.userId))
          .collect();

        await ctx.db.patch(profile._id, {
          score: completions.length,
        });
      }
    }
  },
});

export const getTopUsers = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_score")
      .order("desc")
      .take(10);

    return profiles;
  },
});
