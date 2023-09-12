import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { convertToGrayScale } from "~/util/pixel-math";

export function loader({ params }: { params: { roomId: string } }) {
  return params;
}

function getColors(bins: string[][]) {
  const colors = new Set<string>();
  bins.forEach((bin) => bin.forEach((color) => colors.add(color)));
  const allColors = [...colors];
  allColors.sort().reverse();
  return allColors;
}

export default function Room() {
  const data = useLoaderData<typeof loader>();
  const room = useQuery(api.rooms.queries.getRoom, {
    roomId: data.roomId as Id<"rooms">,
  });
  const colorCell = useMutation(api.rooms.mutations.colorCell);
  const image = useQuery(
    api.images.queries.getImage,
    room
      ? {
          imageId: room.imageId,
        }
      : "skip"
  );

  const [selectedColor, setSelectedColor] = useState<string>();

  if (!room) return null;
  if (!image) return null;
  if (!image.bins) return null;

  const colors = getColors(image.bins);

  function lookupColorIndex(hex: string) {
    return colors.findIndex((color) => color === hex);
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <div className="flex flex-wrap gap-1">
          {colors.map((color, idx) => (
            <button
              onClick={() => setSelectedColor(color)}
              key={color}
              className={classNames(
                "w-10 h-10 rounded-full text-black flex justify-center items-center hover:opacity-80 border hover:border-white",
                {
                  "border-white": selectedColor === color,
                  "border-2": selectedColor === color,
                  "border-transparent": selectedColor !== color,
                }
              )}
              style={{ backgroundColor: color }}
            >
              {idx}
            </button>
          ))}
        </div>
        <div className="flex">
          {image.bins.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="flex flex-col">
                {row.map((cellColor, cellIdx) => {
                  return (
                    <button
                      onClick={async () => {
                        if (
                          !(
                            !room.board[rowIdx][cellIdx] &&
                            selectedColor === cellColor
                          )
                        )
                          return;
                        await colorCell({
                          roomId: data.roomId as Id<"rooms">,
                          rowIdx,
                          cellIdx,
                        });
                      }}
                      key={cellIdx}
                      className={classNames("w-4 h-4 text-black", {
                        "hover:opacity-80":
                          !room.board[rowIdx][cellIdx] &&
                          selectedColor === cellColor,
                        "cursor-default": !(
                          !room.board[rowIdx][cellIdx] &&
                          selectedColor === cellColor
                        ),
                        "cursor-pointer":
                          !room.board[rowIdx][cellIdx] &&
                          selectedColor === cellColor,
                      })}
                      style={{
                        fontSize: "8px",
                        backgroundColor: room.board[rowIdx][cellIdx]
                          ? cellColor
                          : convertToGrayScale(cellColor),
                      }}
                    >
                      {selectedColor === cellColor &&
                        !room.board[rowIdx][cellIdx] &&
                        lookupColorIndex(cellColor)}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
