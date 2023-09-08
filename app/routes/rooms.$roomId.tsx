import { useLoaderData } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { type Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

function convertToGrayScale(hex: string): string {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const grayHex = gray.toString(16).padStart(2, "0");
  const grayScaleHex = `#${grayHex}${grayHex}${grayHex}`;
  return grayScaleHex;
}

export function loader({ params }: { params: { roomId: string } }) {
  return params;
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

  if (!room) return null;
  if (!image) return null;
  if (!image.bins) return null;

  return (
    <div>
      {data.roomId}

      <div className="flex justify-center items-center">
        <div className="flex">
          {image.bins.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="flex flex-col">
                {row.map((cellColor, cellIdx) => {
                  return (
                    <button
                      onClick={async () => {
                        await colorCell({
                          roomId: data.roomId as Id<"rooms">,
                          rowIdx,
                          cellIdx,
                        });
                      }}
                      key={cellIdx}
                      className="w-4 h-4 hover:opacity-80"
                      style={{
                        backgroundColor: room.board[rowIdx][cellIdx]
                          ? cellColor
                          : convertToGrayScale(cellColor),
                      }}
                    ></button>
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
