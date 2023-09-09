export function convertToGrayScale(hex: string): string {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const grayHex = gray.toString(16).padStart(2, "0");
  const grayScaleHex = `#${grayHex}${grayHex}${grayHex}`;
  return grayScaleHex;
}
