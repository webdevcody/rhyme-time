import { query } from "convex/_generated/server";
import { v } from "convex/values";

export const getImages = query({
  async handler(ctx) {
    return ctx.db.query("images").order("desc").collect();
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
