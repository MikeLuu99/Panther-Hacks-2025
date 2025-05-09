import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const challenges = await ctx.db.query("challenges").order("desc").collect();
    return challenges;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db
      .query("challenges")
      .withSearchIndex("search_body", (q) => q.search("title", query))
      .take(10);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const challengeId = await ctx.db.insert("challenges", {
      title: args.title,
      description: args.description,
      createdBy: userId,
      status: "active",
    });

    return challengeId;
  },
});

export const getTasks = query({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    const tasksWithCompletion = await Promise.all(
      tasks.map(async (task) => {
        const completion = await ctx.db
          .query("taskCompletions")
          .withIndex("by_task_user", (q) => q.eq("taskId", task._id))
          .first();

        if (completion) {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", completion.userId))
            .unique();

          const image = await ctx.db
            .query("images")
            .filter((q) => q.eq(q.field("taskId"), task._id))
            .first();

          return {
            ...task,
            completedBy: profile?.nickname || "Unknown User",
            completedAt: completion.completedAt,
            imageId: image?._id,
          };
        }
        return task;
      }),
    );

    return tasksWithCompletion;
  },
});

export const createTask = mutation({
  args: {
    challengeId: v.id("challenges"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("tasks", {
      challengeId: args.challengeId,
      title: args.title,
      description: args.description,
      status: "pending",
    });
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_user", (q) =>
        q.eq("taskId", args.taskId).eq("userId", userId),
      )
      .unique();

    if (existing) throw new Error("Task already completed");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.insert("taskCompletions", {
      taskId: args.taskId,
      userId,
      completedAt: Date.now(),
    });

    await ctx.db.patch(args.taskId, {
      status: "completed",
    });

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_challenge", (q) => q.eq("challengeId", task.challengeId))
      .collect();

    const allCompleted = allTasks.every((t) => t.status === "completed");

    if (allCompleted) {
      await ctx.db.patch(task.challengeId, {
        status: "completed",
      });
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        score: (profile.score || 0) + 1,
      });
    }
  },
});
