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
          <div className="flex flex-col  gap-6 justify-center items-center h-[20vh]">
            
            {option ? (
              <>
              <div className="flex gap-6 justify-center flex-wrap w-full pt-16">
                <button
                  className="btn btn-secondary w-1/3"
                  onClick={() => {
                    setButtonOption("Create");
                    setOption(false);
                  }}
                >
                  Create Room
                </button>
                <button
                  className="btn btn-info w-1/3"
                  onClick={() => {
                    setButtonOption("Join");
                    setOption(false);
                  }}
                >
                  Join Room
                </button>
                <button className="btn btn-error w-1/3 " 
                  onClick={() => {
                    setButtonOption("Spectate");
                    setOption(false);
                  }}
                > Spectate </button>
                <button className="btn btn-warning w-1/3"> Practice Room </button>
                </div>
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
