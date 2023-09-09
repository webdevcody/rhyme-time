import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  images: defineTable({
    bins: v.optional(v.array(v.array(v.string()))),
    imageId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    prompt: v.string(),
  }),
  rooms: defineTable({
    userId: v.string(),
    imageId: v.id("images"),
    board: v.array(v.array(v.boolean())),
  })
    .index("by_imageId", ["imageId"])
    .index("by_userId", ["userId"]),
});
