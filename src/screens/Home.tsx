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
