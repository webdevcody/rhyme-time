import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { convertToGrayScale } from "~/util/pixel-math";

export default function Room() {
  const rooms = useQuery(api.rooms.queries.getUserRooms);
  if (!rooms) return null;

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-8">Your Rooms</h1>
      <div className="flex gap-8 flex-wrap">
        {rooms.map((room) => {
          return (
            <Link
              to={`/rooms/${room._id}`}
              key={room._id}
              className="flex hover:scale-110"
            >
              {room.image?.bins?.map((row, rowIdx) => (
                <div key={rowIdx} className="flex flex-col">
                  {row.map((cellColor, cellIdx) => {
                    return (
                      <div
                        key={cellIdx}
                        className="w-1 h-1"
                        style={{
                          backgroundColor: room.board[rowIdx][cellIdx]
                            ? cellColor
                            : convertToGrayScale(cellColor),
                        }}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
