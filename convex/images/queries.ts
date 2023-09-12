import { query } from "convex/_generated/server";
import { v } from "convex/values";

export const getImages = query({
  args: {
    filter: v.string(),
  },
  async handler(ctx, args) {
    if (args.filter) {
      return ctx.db
        .query("images")
        .withSearchIndex("search_prompt", (q) =>
          q.search("prompt", args.filter)
        )
        .take(10);
    } else {
      return ctx.db.query("images").order("desc").take(10);
    }
  },
});

export const getImage = query({
  args: {
    imageId: v.id("images"),
  },
  async handler(ctx, args) {
    return ctx.db.get(args.imageId);
  },
});
