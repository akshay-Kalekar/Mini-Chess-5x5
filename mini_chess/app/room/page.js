"use client";

import { Suspense } from "react";
import { GameLayoutFirebase } from "./type/GameLayoutFirebase";
import { GameLayoutWS } from "./type/GameLayoutWS";


export default function GameLayoutPage(){
    console.log(process.env.server_realtime_db);
    
    if(process.env.server_realtime_db){
        return (
            <Suspense fallback={<div>Loading . . . </div>}>
                <GameLayoutWS/>
            </Suspense>
        )
    }
    return (
        <Suspense fallback={<div>Loading . . . </div>}>
            <GameLayoutFirebase/>
        </Suspense>
    )
};
