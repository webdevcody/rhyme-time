import { query } from "convex/_generated/server";
import { v } from "convex/values";

export const getImage = query({
  args: {
    word: v.string(),
  },
  async handler(ctx, args) {
    return ctx.db
      .query("images")
      .withIndex("by_word", (q) => q.eq("word", args.word))
      .first();
  },
});
