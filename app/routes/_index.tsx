import type { V2_MetaFunction } from "@remix-run/node";
import { useMutation, useQuery } from "convex/react";
import { Spinner } from "~/components/spinner";
import { useEffect, useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import { SpeakerIcon } from "~/components/speaker";
import { api } from "convex/_generated/api";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Rhyme Time" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [setId, setSetId] = useState<Id<"sets">>();
  const createSet = useMutation(api.sets.mutations.createRhymeSet);
  const set = useQuery(api.sets.queries.getSet, setId ? { setId } : "skip");

  function newRound() {
    setSetId(undefined);
    createSet().then(setSetId);
  }

  useEffect(() => {
    newRound();
  }, []);

  return (
    <div className="container mx-auto flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-12 mx-auto">
        {set?.words ? (
          <>
            {set?.words?.map((word, idx) => (
              <div key={idx} className="flex flex-col gap-8">
                <div className="w-full flex justify-center items-center">
                  {set.imageMap[word] ? (
                    <img key={word} alt={`${word}`} src={set.imageMap[word]} />
                  ) : (
                    <div className="w-[256px] h-[256px]">
                      <Spinner />
                    </div>
                  )}
                </div>
                <h2 className="self-center text-5xl">{word}</h2>
                <button
                  className="self-center bg-gray-500 hover:bg-gray-600 rounded px-2 py-1"
                  onClick={async () => {
                    const voiceUrl = set.voiceMap[word];
                    if (!voiceUrl) return;
                    const audio = new Audio(voiceUrl);
                    audio.play();
                  }}
                >
                  <SpeakerIcon />
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 rounded px-2 py-1"
                  onClick={() => {
                    if (word === set.wrong) {
                      const audio = new Audio("correct.mp3");
                      audio.play();
                      newRound();
                    } else {
                      const audio = new Audio("wrong.mp3");
                      audio.play();
                    }
                  }}
                >
                  Select
                </button>
              </div>
            ))}
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
}
