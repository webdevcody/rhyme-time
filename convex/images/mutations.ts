import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const saveImage = internalMutation({
  args: {
    bins: v.array(v.array(v.string())),
    imageId: v.string(),
    imageUrl: v.string(),
    prompt: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("images", {
      bins: args.bins,
      imageId: args.imageId,
      imageUrl: args.imageUrl,
      board: args.bins.map((bin) => bin.map(() => null)),
      prompt: args.prompt,
    });
  },
});
