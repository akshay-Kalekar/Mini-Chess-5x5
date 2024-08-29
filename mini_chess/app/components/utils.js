
import Image from 'next/image';
import ruleIcon from '../../public/rule.svg';
export const RulesModal = () => {
  return (
    <div>
       <button className="btn" onClick={()=>document.getElementById('my_modal_1').showModal()}> 
       <Image
       src={ruleIcon}
        alt="Rules"
        height={20}
        width={20}
       />
       Game Rules</button>
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
  )
}


export const Loading  = () =>{
    return (
        <> Loading . . .</>
    );
}

import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export const CodeInput = ({ button, setOption, }) => {
    const router = useRouter();
    const [code, setCode] = useState('');

    const handleClick = (roomCode) => {
      if(button=='Join'){
          router.push(`/room?roomCode=${code}&type=JOIN_ROOM`);
        }else{
          router.push(`/room?roomCode=${code}&type=CREATE_ROOM`);
      }
    };

    return (
        <div className='flex flex-col gap-4 items-center'>
            <div className="join input pr-0">
                <input 
                    className="input-bordered join-item w-3/5" 
                    placeholder="Enter code" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)}
                />
                <button className="btn btn-accent join-item rounded-r-md w-2/5 h-1/3" onClick={handleClick}>
                    {button}
                </button>
            </div>
            <button 
                className="btn btn-error join-item rounded-r-md w-3/5" 
                onClick={() => setOption(true)}
            >
                Back
            </button>
        </div>
    );
};


