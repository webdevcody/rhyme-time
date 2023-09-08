import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const createInitialImage = internalMutation({
  args: {
    prompt: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("images", {
      prompt: args.prompt,
    });
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
