import { useEffect, useRef, useState } from "react";
import { SideNav } from "../components/sidenav/SideNav";
import { invoke } from "@tauri-apps/api/core";
import Server from "../components/server/Server";
import { Splash } from "./Splash";

export function Home(){
  const [publickey, setPublickey] = useState("");
  const ran = useRef(false);
  const [splash, setSpash] = useState(true);

  useEffect(() => {
    initState();
  }, [])

  async function initState() {
    if(ran.current) return;
    ran.current = true;
    console.log("INIT STATE");
    await invoke("init_state");
    setSpash(false)
  }

  async function startCall(){
    await invoke("start_call");
  }

  async function joinCall(){
    const remotePkStr = publickey;
    await invoke("join_call", { remotePkStr });
  }

  return (
    <>
      {splash ? 
      <Splash/> : 
      <div className="flex relative bg-off-black-700 h-screen w-screen text-deep-purple-100 overflow-hidden">
        <SideNav/>
        <Server/>
        {/* <div className="flex gap-5 w-full h-full bg-deep-purple-300">
          <button onClick={startCall} className="flex place-items-center justify-center w-24 h-12 bg-deep-purple-500 hover:cursor-pointer">
            Start Call
          </button>
          <input className="h-12 w-56"
            id="publickey"
            onChange={(e) => setPublickey(e.currentTarget.value)}
            placeholder="publickey"
          />
          <button onClick={joinCall} className="bg-deep-purple-500 hover:cursor-pointer h-12 w-32" type="submit">set public key</button>

        </div> */}
        {/* FIX BELOW SO NOT SUPER SPECIFIC WITH THE DIMENSIONS BASED ON OTHER SCREENS */}
        <div className="overflow-hidden absolute top-0 w-24 h-56 select-none pointer-events-none">
          <div className="absolute top-0 w-24 bg-off-black-700 border-b-2 border-off-black-400 h-[156px] shadow-lg shadow-off-black-700"/>
        </div>
        <div className="overflow-hidden absolute bottom-0 w-24 h-40 select-none pointer-events-none">
          <div className="absolute bottom-0 w-24 bg-off-black-700 border-t-2 border-off-black-400 h-[88px] shadow-[0px_-10px_15px_-3px_rgba(0,0,0,0.1)] shadow-off-black-700"/>
        </div>
      </div>
      }
    </>
  )
}

// function CurrentScreen(){
//   // const currentScreen = useGlobalStore((globals) => globals.currentScreen)
//   switch(currentScreen){
//     case 'Server':
//       return(<Server/>)
//     case 'DirectMessages':
//       return(<DirectMessages/>)
//     case 'Settings':
//       return(<Settings/>)
//   }
// }
