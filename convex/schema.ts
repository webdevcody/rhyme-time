import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sets: defineTable({
    words: v.optional(v.array(v.string())),
    wrong: v.optional(v.string()),
  }),
  images: defineTable({
    word: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_word", ["word"]),
  voices: defineTable({
    word: v.optional(v.string()),
    voiceUrl: v.optional(v.string()),
  }).index("by_word", ["word"]),
});
