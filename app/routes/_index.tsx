import type { V2_MetaFunction } from "@remix-run/node";
import { api } from "convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { Spinner } from "~/components/spinner";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ prompt: string }>();

  const images = useQuery(api.images.queries.getImages);
  const createImage = useAction(api.images.actions.createImage);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4 mt-8">Generate an Image</h1>

      <form
        onSubmit={handleSubmit(async (formData) => {
          await createImage({
            prompt: formData.prompt,
          });
          reset();
        })}
        className="flex flex-col justify-start mb-8"
      >
        <input
          placeholder="enter a prompt"
          className="mb-1 w-1/3 p-2 rounded-md text-black"
          {...register("prompt", { required: true })}
        />
        {errors.prompt && (
          <span className="text-red-400">This field is required</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex gap-1 items-center disabled:bg-gray-400 disabled:hover:bg-gray-400 mt-4 self-start bg-blue-400 hover:bg-blue-500 rounded-md px-2 py-1"
        >
          {isSubmitting && <Spinner />}
          Generate Image
        </button>
      </form>

      <div className="grid grid-cols-4 gap-12">
        {images?.map((image) => {
          return image.imageUrl ? (
            <img
              key={image.imageUrl}
              src={image.imageUrl}
              className="w-100 rounded-xl"
            />
          ) : (
            <div className="w-100 h-full flex justify-center items-center">
              <Spinner />
            </div>
          );
        })}
      </div>
    </div>
  );
}
