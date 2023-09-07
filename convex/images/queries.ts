import { query } from "convex/_generated/server";

export const getImages = query({
  async handler(ctx) {
    return ctx.db.query("images").order("desc").collect();
  },
});
