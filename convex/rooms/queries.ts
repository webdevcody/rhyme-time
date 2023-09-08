import { query } from "convex/_generated/server";
import { v } from "convex/values";

export const getRoom = query({
  args: {
    roomId: v.id("rooms"),
  },
  async handler(ctx, args) {
    return ctx.db.get(args.roomId);
  },
});
