"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

export const generateWordImage = internalAction({
  args: {
    word: v.string(),
  },
  async handler(ctx, args) {
    const image = await ctx.runQuery(api.images.queries.getImage, {
      word: args.word,
    });
    if (image) return;
    const imageResponse = await fetch(
      `https://api.openai.com/v1/images/generations`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: `image of a ${args.word}, childrens drawing, vivid colors, centered`,
          n: 1,
          size: "256x256",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPEN_API_KEY}`,
        },
      }
    ).then((response) => response.json());
    const imageUrl = imageResponse.data[0].url;
    const imageData = await fetch(imageUrl).then((response) => response.blob());
    const imageId = await ctx.storage.store(imageData);
    const url = await ctx.storage.getUrl(imageId);
    await ctx.runMutation(internal.images.mutations.createImage, {
      word: args.word,
      imageUrl: url!,
    });
  },
});
