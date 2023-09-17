import { query } from "convex/_generated/server";
import { v } from "convex/values";
import { shuffle } from "lodash";

export const getSet = query({
  args: {
    setId: v.id("sets"),
  },
  async handler(ctx, args) {
    const set = await ctx.db.get(args.setId);

    if (!set) return null;

    async function getImageUrl(word: string) {
      const image = await ctx.db
        .query("images")
        .withIndex("by_word", (q) => q.eq("word", word))
        .first();
      return image?.imageUrl;
    }

    const imageMap = {} as Record<string, string | null>;
    if (!set.words) {
      return { ...set, imageMap };
    }

    const imageUrls = await Promise.all(
      set.words.map((word) => getImageUrl(word))
    );
    set.words.forEach((word, idx) => {
      imageMap[word] = imageUrls[idx] ?? null;
    });

    return {
      ...set,
      imageMap,
    };
  },
});
