"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import Jimp from "jimp";

function generateDalleImage(prompt: string) {
  return fetch(`https://api.openai.com/v1/images/generations`, {
    method: "POST",
    body: JSON.stringify({
      prompt: prompt + ", 8 bit, game art, contained inside canvas, centered",
      n: 1,
      size: "1024x1024",
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    },
  }).then((response) => response.json());
}

async function generateImageUsingDalle({ prompt }: { prompt: string }) {
  const imageResponse = await generateDalleImage(prompt);
  const imageUrl = imageResponse.data[0].url;
  const imageData = await fetch(imageUrl);
  return await imageData.arrayBuffer();
}

export const createImage = action({
  args: {
    prompt: v.string(),
  },
  async handler(ctx, args) {
    const _id = await ctx.runMutation(
      internal.images.mutations.createInitialImage,
      {
        prompt: args.prompt,
      }
    );

    const dalleImage = await generateImageUsingDalle({ prompt: args.prompt });

    const image = await Jimp.read(Buffer.from(dalleImage));

    function rgbToHex(rgbArray: [Number, Number, Number]) {
      const [r, g, b] = rgbArray;
      const rHex = r.toString(16).padStart(2, "0");
      const gHex = g.toString(16).padStart(2, "0");
      const bHex = b.toString(16).padStart(2, "0");
      return `#${rHex}${gHex}${bHex}`;
    }

    function getMostCommonColor(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      const colorMap = new Map();

      for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
          const pixelColor = Jimp.intToRGBA(image.getPixelColor(i, j));
          const color = `${pixelColor.r},${pixelColor.g},${pixelColor.b}`;
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
      }

      const mostCommonColor = [...colorMap.entries()].reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        [null, 0]
      );

      const rgb = mostCommonColor[0].split(",").map(Number);

      return { hex: rgbToHex(rgb), rgb };
    }

    // Divide the image into 42x42 bins and calculate the most common color for each bin
    const binSize = 1024 / 42;
    const bins = [];

    for (let x = 0; x < 1024; x += binSize) {
      const row = [];
      for (let y = 0; y < 1024; y += binSize) {
        const mostCommonColor = getMostCommonColor(x, y, binSize, binSize);
        row.push(mostCommonColor);
      }
      bins.push(row);
    }

    const resultImage = new Jimp(1024, 1024);

    for (let x = 0; x < 42; x++) {
      for (let y = 0; y < 42; y++) {
        const color = bins[x][y];
        const [r, g, b] = color.rgb;

        for (let i = 0; i < binSize; i++) {
          for (let j = 0; j < binSize; j++) {
            const pixelX = x * binSize + i;
            const pixelY = y * binSize + j;
            resultImage.setPixelColor(
              Jimp.rgbaToInt(r, g, b, 255),
              pixelX,
              pixelY
            );
          }
        }
      }
    }

    const resultBuffer = await resultImage.getBufferAsync(Jimp.MIME_PNG);

    const resultBlob = new Blob([resultBuffer], { type: "image/png" });

    const imageId = await ctx.storage.store(resultBlob);
    const imageUrl = await ctx.storage.getUrl(imageId);

    if (!imageUrl) {
      throw new Error("image was not saved correctly into convex file storage");
    }

    await ctx.runMutation(internal.images.mutations.updateImage, {
      _id,
      bins: bins.map((bin) => bin.map((b) => b.hex)),
      imageId,
      imageUrl,
    });
  },
});
