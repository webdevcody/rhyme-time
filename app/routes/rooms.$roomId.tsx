import { useLoaderData } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { type Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { convertToGrayScale } from "~/util/pixel-math";

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
                      className="w-3 h-3 hover:opacity-80"
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
