import { internal } from "convex/_generated/api";
import { internalAction } from "convex/_generated/server";
import { v } from "convex/values";

export const generateVoices = internalAction({
  args: {
    words: v.array(v.string()),
  },
  async handler(ctx, args) {
    async function generateVoice(word: string) {
      const voiceUrl = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/TxGEqnHWrfWFTfGW9XjX",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVEN_LABS_KEY!,
          },
          body: JSON.stringify({
            text: word,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      ).then(async (response) => {
        const voiceUrl = await ctx.storage.store(await response.blob());
        return ctx.storage.getUrl(voiceUrl);
      });

      await ctx.runMutation(internal.voices.mutations.createVoice, {
        voiceUrl: voiceUrl!,
        word,
      });
    }

    for (let word of args.words) {
      await generateVoice(word);
    }
  },
});
