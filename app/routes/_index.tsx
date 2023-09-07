import type { V2_MetaFunction } from "@remix-run/node";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const images = useQuery(api.images.queries.getImages);

  return (
    <>
      <h1 className="text-3xl font-bold underline">HI</h1>

      {images?.map((image) => {
        return (
          <img key={image.imageUrl} src={image.imageUrl} className="w-1/3" />
        );
      })}
    </>
  );
}
