"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import Jimp from "jimp";

const IMAGE_RESOLUTION = 1024;
const BINS = 64;

type ColorInfo = {
  hex: string;
  rgb: [number, number, number];
};

function generateAll8BitColors() {
  const hexColors = [] as ColorInfo[];

  // Iterate through all possible combinations of R, G, and B values (0 to 255)
  for (let r = 0; r <= 255; r += 51) {
    // Increment by 51 to get 6 levels of red
    for (let g = 0; g <= 255; g += 51) {
      // Increment by 51 to get 6 levels of green
      for (let b = 0; b <= 255; b += 51) {
        // Increment by 51 to get 6 levels of blue
        // Convert decimal values to 2-digit hexadecimal values
        const hexR = r.toString(16).padStart(2, "0");
        const hexG = g.toString(16).padStart(2, "0");
        const hexB = b.toString(16).padStart(2, "0");

        // Create a hex color in the format "#RRGGBB"
        const hexColor = `#${hexR}${hexG}${hexB}`;

        hexColors.push({
          rgb: [parseInt(hexR, 16), parseInt(hexG, 16), parseInt(hexB, 16)],
          hex: hexColor,
        });
      }
    }
  }

  return hexColors;
}

// Helper function to calculate the Euclidean distance between two RGB colors
function colorDistance(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const r1 = color1[0];
  const g1 = color1[1];
  const b1 = color1[2];
  const r2 = color2[0];
  const g2 = color2[1];
  const b2 = color2[2];
  return Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2);
}

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

function findClosestColor(
  targetRgb: [number, number, number],
  colors: Set<ColorInfo>
): ColorInfo {
  let closestColor: ColorInfo | null = null;
  let closestDistance = Number.MAX_VALUE;

  for (const color of colors) {
    const numberColors = color.rgb;
    const distance = colorDistance(targetRgb, numberColors);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestColor = color;
    }
  }

  return closestColor!;
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
    imageId: v.id("images"),
  },
  async handler(ctx, args) {
    const dalleImage = await generateImageUsingDalle({ prompt: args.prompt });

    const image = await Jimp.read(Buffer.from(dalleImage));

    function rgbToHex(rgbArray: [number, number, number]) {
      const toHex = (channel: number) =>
        (channel & 0xff).toString(16).padStart(2, "0");
      return `#${rgbArray.map(toHex).join("")}`;
    }

    function getMostCommonColor(
      x: number,
      y: number,
      width: number,
      height: number
    ): ColorInfo {
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

      const rgb = mostCommonColor[0].split(",");

      return { hex: rgbToHex(rgb), rgb };
    }

    const binSize = IMAGE_RESOLUTION / BINS;
    const reducedColors = generateAll8BitColors();

    const bins = [] as ColorInfo[][];
    for (let x = 0; x < IMAGE_RESOLUTION; x += binSize) {
      const row = [];
      for (let y = 0; y < IMAGE_RESOLUTION; y += binSize) {
        const common = getMostCommonColor(x, y, binSize, binSize);
        const numberColors = common.rgb;
        const mostCommonColor = findClosestColor(
          numberColors,
          new Set(reducedColors)
        );
        row.push(mostCommonColor);
      }
      bins.push(row);
    }

    const resultImage = new Jimp(IMAGE_RESOLUTION, IMAGE_RESOLUTION);

    for (let x = 0; x < BINS; x++) {
      for (let y = 0; y < BINS; y++) {
        const color = bins[x][y];
        if (!color) continue;
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
      _id: args.imageId,
      bins: bins.map((bin) =>
        bin.map((b) => {
          return b.hex;
        })
      ),
      imageId,
      imageUrl,
    });
  },
});
