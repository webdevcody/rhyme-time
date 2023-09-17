import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { internal } from "convex/_generated/api";
import { shuffle } from "lodash";

export const createRhymeSet = mutation({
  async handler(ctx) {
    const setId = await ctx.db.insert("sets", {});

    await ctx.scheduler.runAfter(0, internal.sets.actions.generateRhymeSet, {
      setId,
    });

    return setId;
  },
});

export const updateSet = internalMutation({
  args: {
    setId: v.id("sets"),
    words: v.array(v.string()),
    wrong: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.setId, {
      words: shuffle(args.words),
      wrong: args.wrong,
    });
  },
});
