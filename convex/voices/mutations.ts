import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const createVoice = internalMutation({
  args: {
    word: v.string(),
    voiceUrl: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("voices", {
      word: args.word,
      voiceUrl: args.voiceUrl,
    });
  },
});
