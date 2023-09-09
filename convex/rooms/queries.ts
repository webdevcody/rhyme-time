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

export const getUserRooms = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const rooms = await ctx.db.query("rooms").withIndex("by_userId").collect();

    return await Promise.all(
      rooms.map(async (room) => {
        return {
          ...room,
          image: await ctx.db.get(room.imageId),
        };
      })
    );
  },
});
