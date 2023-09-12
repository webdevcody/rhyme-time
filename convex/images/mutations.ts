import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { api } from "convex/_generated/api";

export const createInitialImage = mutation({
  args: {
    prompt: v.string(),
  },
  async handler(ctx, args) {
    const imageId = await ctx.db.insert("images", {
      prompt: args.prompt,
    });

    await ctx.scheduler.runAfter(0, api.images.actions.createImage, {
      imageId,
      prompt: args.prompt,
    });

    return imageId;
  },
});

export const updateImage = internalMutation({
  args: {
    _id: v.id("images"),
    bins: v.array(v.array(v.string())),
    imageId: v.string(),
    imageUrl: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args._id, {
      bins: args.bins,
      imageId: args.imageId,
      imageUrl: args.imageUrl,
    });
  },
});
