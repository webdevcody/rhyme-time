"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import OpenAI from "openai";

type RhymeSet = {
  words: [string, string, string];
  wrong: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

export const generateRhymeSet = internalAction({
  args: {
    setId: v.id("sets"),
  },
  async handler(ctx, args) {
    const input = `
    Generate me a set of kindergarten friendly words.  
    
    Two of these words must rhyme.
    
    The third word must NOT rhyme with the other two.

    Without any comment, return your answer in the following ECMA-404 compliant JSON format:

    {
      words: ["cat", "hat", "dog"],
      wrong: "dog"
    }

    please make sure the wrong word is one of the values inside of the words array.
    please use a variety of words that rhyme that would be good for kids to learn.
    please make sure all three words do not rhyme.
  `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      model: "gpt-4",
      temperature: 1,
    });
    // const input = args.message;
    const response = completion.choices[0].message.content ?? "";
    const info = JSON.parse(response) as RhymeSet;

    await Promise.all(
      info.words.map((word) => {
        return ctx.scheduler.runAfter(
          0,
          internal.images.actions.generateWordImage,
          {
            word,
          }
        );
      })
    );

    await ctx.scheduler.runAfter(0, internal.voices.actions.generateVoices, {
      words: info.words,
    });

    await ctx.runMutation(internal.sets.mutations.updateSet, {
      setId: args.setId,
      words: info.words,
      wrong: info.wrong,
    });
  },
});
