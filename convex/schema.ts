import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    nickname: v.string(),
    score: v.optional(v.float64()),
    selectedBackground: v.optional(v.string()),
    purchasedBackgrounds: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_score", ["score"]),

  storeItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.float64(),
    imageUrl: v.string(),
    type: v.string(),
  }),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    createdBy: v.id("users"),
    status: v.union(v.literal("active"), v.literal("completed")),
  }).searchIndex("search_body", {
    searchField: "title",
  }),

  tasks: defineTable({
    challengeId: v.id("challenges"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
    imageId: v.optional(v.id("images")),
    completedBy: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
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
