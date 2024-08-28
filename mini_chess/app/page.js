"use client";

import {  useState } from "react";
import { RulesModal, CodeInput } from "./components/utils";

export default function Home() {
  const [buttonOption, setButtonOption] = useState("");
  const [option, setOption] = useState(true);

  return (
    <div className="hero bg-base-200 min-h-screen p-16">
      <div className="flex w-full h-full">
        <RulesModal />
      </div>

      <div className="hero-content text-center">
        <div className="max-w-md p-4">
          <h1 className="text-6xl font-extrabold">Mini Chess</h1>
          <p className="py-6 text-4xl font-bold">5 x 5</p>
          <div className="flex gap-12 justify-center h-[20vh]">
            {option ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setButtonOption("Create");
                    setOption(false);
                  }}
                >
                  Create Room
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => {
                    setButtonOption("Join");
                    setOption(false);
                  }}
                >
                  Join Room
                </button>
              </>
            ) : (
              <CodeInput
                button={buttonOption}
                setOption={setOption}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
