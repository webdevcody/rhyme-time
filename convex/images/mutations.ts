import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const createImage = internalMutation({
  args: {
    word: v.string(),
    imageUrl: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("images", {
      word: args.word,
      imageUrl: args.imageUrl,
    });
  },
});
