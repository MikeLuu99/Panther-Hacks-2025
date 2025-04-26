import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    nickname: v.string(),
    score: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    createdBy: v.id("users"),
    status: v.union(v.literal("active"), v.literal("completed")),
  }),

  tasks: defineTable({
    challengeId: v.id("challenges"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
    imageId: v.optional(v.id("images")),
  }).index("by_challenge", ["challengeId"]),

  images: defineTable({
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    description: v.string(),
    mimeType: v.string(),
    size: v.number(),
  }),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    completedAt: v.number(),
  }).index("by_task_user", ["taskId", "userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
