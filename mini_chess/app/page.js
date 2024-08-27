"use client";
import Image from "next/image";
import GameLayout from "./components/GameLayout";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24" >
      <div className="z-10  max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Mini Chess 5 x 5
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        <button className="btn" onClick={()=>document.getElementById('my_modal_1').showModal()}>Rules</button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Game Rules</h3>
            <div className="py-4">
              <strong>Characters and Movement:</strong><br/>
              There are three types of characters available:<br/>
              <br/>
              <strong>1. Pawn: (P1,P2,P3)</strong><br/>
              Moves one block in any direction (Left, Right, Forward, or Backward).<br/>
              <strong>Move commands:</strong><br/>
              <ul className="list-disc pl-5">
                <li>L (Left)</li>
                <li>R (Right)</li>
                <li>F (Forward)</li>
                <li>B (Backward)</li>
              </ul>
              <br/>
              <strong>2. Hero1: (H1)</strong><br/>
              Moves two blocks straight in any direction.<br/>
              Kills any opponent's character in its path.<br/>
              <strong>Move commands:</strong><br/>
              <ul className="list-disc pl-5">
                <li>L (Left)</li>
                <li>R (Right)</li>
                <li>F (Forward)</li>
                <li>B (Backward)</li>
              </ul>
              <br/>
              <strong>3. Hero2: (H2)</strong><br/>
              Moves two blocks diagonally in any direction.<br/>
              Kills any opponent's character in its path.<br/>
              <strong>Move commands:</strong><br/>
              <ul className="list-disc pl-5">
                <li>FL (Forward-Left)</li>
                <li>FR (Forward-Right)</li>
                <li>BL (Backward-Left)</li>
                <li>BR (Backward-Right)</li>
              </ul>
              <br/>
              <strong>Name Convention:</strong> Player1-Piece_Name
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

        </div>
      </div>
      <div className=" w-3/5 h-full  justify-center flex place-items-center ">
     <GameLayout />
      </div>

      
    </main>
  );
}
