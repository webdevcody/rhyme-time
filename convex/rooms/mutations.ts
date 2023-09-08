import { mutation } from "convex/_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    imageId: v.id("images"),
  },
  async handler(ctx, args) {
    const image = await ctx.db.get(args.imageId);

    if (!image) return;
    if (!image.bins) return;

    return await ctx.db.insert("rooms", {
      imageId: args.imageId,
      board: image.bins.map((bin) => bin.map(() => false)),
    });
  },
});

export const colorCell = mutation({
  args: {
    rowIdx: v.number(),
    cellIdx: v.number(),
    roomId: v.id("rooms"),
  },
  async handler(ctx, args) {
    const room = await ctx.db.get(args.roomId);
    if (!room) return;
    room.board[args.rowIdx][args.cellIdx] = true;
    return await ctx.db.patch(room._id, {
      board: room.board,
    });
  },
});
