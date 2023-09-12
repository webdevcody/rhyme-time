import type { V2_MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Spinner } from "~/components/spinner";
import { useState } from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [search, setSearch] = useState("");
  const images = useQuery(api.images.queries.getImages, {
    filter: search,
  });
  const createRoom = useMutation(api.rooms.mutations.createRoom);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex flex-col gap-8">
      <h1 className="text-4xl font-bold">Search for an Image</h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setSearch((formData.get("filter") as string) ?? "");
        }}
      >
        <input
          placeholder="space ship, dog, cat, food, etc."
          name="filter"
          className="text-black rounded px-2 py-2 text-lg self-end w-[300px]"
        ></input>
        <button className="disabled:bg-gray-400 disabled:hover:bg-gray-400 mt-4 bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 text-xl">
          Search
        </button>
      </form>

      <div className="grid grid-cols-4 gap-12">
        {images?.map((image) => {
          return image.imageUrl ? (
            <button
              key={image._id}
              onClick={async () => {
                const roomId = await createRoom({
                  imageId: image._id,
                });
                navigate(`/rooms/${roomId}`);
              }}
            >
              <img
                alt={image.prompt}
                src={image.imageUrl}
                className="w-100 rounded-xl hover:scale-110"
              />
            </button>
          ) : (
            <div
              key={image._id}
              className="w-100 h-full flex justify-center items-center"
            >
              <Spinner />
            </div>
          );
        })}
      </div>
    </div>
  );
}
