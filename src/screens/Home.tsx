import { useEffect, useRef, useState } from "react";
import { SideNav } from "../components/sidenav/SideNav";
import { invoke } from "@tauri-apps/api/core";
import Server from "../components/server/Server";
import { Splash } from "./Splash";
import MetaMaskConnect from "../components/MetaMaskConnect";
import ConnectButton from "../components/ConnectButton";
// import { WalletConnectButton } from "../components/WalletConnectButton";
import Login from "./Login";
import { useGlobalStore } from "../state-management/globalStore";
import { DirectMessages } from "../components/dms/DirectMessages";
import { Settings } from "../components/settings/Settings";
import { useServerStore } from "../state-management/serverStore";

export default function Home(){
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
    // await invoke("get_wc_uri")
    setSpash(false)
  }
  
  return (
    <>
      {splash ? 
      <Splash/> : 
      <div className="flex relative bg-off-black-700 h-screen w-screen text-deep-purple-100 overflow-hidden">
        <SideNav/>
        <div className="w-full h-full">
          <CurrentScreen/>
        </div>
      </div>
      }
    </>
  )
}

function CurrentScreen(){
  const currentScreen = useGlobalStore(globals => globals.currentScreen)
  const clearMessages = useServerStore(server => server.clearMessages)
  switch(currentScreen){
    case 'Server':
      clearMessages()
      return(<Server/>)
    case 'DirectMessages':
      clearMessages()
      return(<DirectMessages/>)
    case 'Settings':
      clearMessages()
      return(<Settings/>)
  }
}
