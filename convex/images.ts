import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    description: v.string(),
    mimeType: v.string(),
    size: v.number(),
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      storageId: args.storageId,
      fileName: args.fileName,
      description: args.description,
      mimeType: args.mimeType,
      size: args.size,
      taskId: args.taskId,
    });
  },
});

// Query to get a single image by ID
export const getById = query({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) return null;

    return {
      ...image,
      url: await ctx.storage.getUrl(image.storageId),
    };
  },
});
