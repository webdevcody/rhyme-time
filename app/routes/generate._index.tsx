import type { V2_MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { type Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "~/components/spinner";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Generate" },
    {
      name: "description",
      content: "Generate a new image to start painting with",
    },
  ];
};

export default function Generate() {
  const [imageId, setImageId] = useState<Id<"images">>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ prompt: string }>();

  const image = useQuery(
    api.images.queries.getImage,
    imageId
      ? {
          imageId,
        }
      : "skip"
  );
  const createInitialImage = useMutation(
    api.images.mutations.createInitialImage
  );
  const createRoom = useMutation(api.rooms.mutations.createRoom);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-md flex flex-col gap-8">
      <h1 className="text-4xl font-bold">Generate an Image</h1>

      <form
        onSubmit={handleSubmit(async (formData) => {
          const newImageId = await createInitialImage({
            prompt: formData.prompt,
          });
          setImageId(newImageId);
          reset();
        })}
        className="flex flex-col justify-start gap-2"
      >
        <input
          placeholder="enter a prompt"
          className="p-2 rounded-md text-black"
          {...register("prompt", { required: true })}
        />
        {errors.prompt && (
          <span className="text-red-400">This field is required</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full justify-center flex gap-1 items-center disabled:bg-gray-400 disabled:hover:bg-gray-400 mt-4 self-start bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 text-xl"
        >
          {isSubmitting && <Spinner />}
          Generate Image
        </button>
      </form>

      {image?.imageUrl && (
        <>
          <div className="flex flex-col gap-4">
            <div className="text-center text-xl">Click to Start Painting</div>

            <button
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
                className="w-100 rounded-xl hover:scale-105 hover:opacity-95 hover:border-4 border-white"
              />
            </button>
          </div>
        </>
      )}

      {image && !image.imageUrl && (
        <div className="w-100 h-full flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
