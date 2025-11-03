import { useEffect, useState } from "react";
import { ServerButton } from "./ServerButton";
import messageBubble from "../../assets/icons/message_bubble.svg"
import { OptionsMenuButton } from "./optionsMenu/OptionsMenuButton";
import { invoke } from "@tauri-apps/api/core";
import { tryCatch } from "../../tryCatch";
import { ServerMetadata, ServerType } from "../../types/serverTypes";
import { ProfileControls } from "../user/ProfileControls";
import { useGlobalStore } from "../../state-management/globalStore";

export function SideNav(){
  const [serverList, setServerList] = useState<any>([]);
  const [serverListLength, setServerListLength] = useState(0);
  const setCurrentScreen = useGlobalStore(globals => globals.setCurrentScreen)
  const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer)

  useEffect(() => {
    fetchServers();
  }, [serverListLength])

  async function fetchServers(){
    console.log("getting all servers")
    const result = await tryCatch(invoke("get_all_servers"));
    if(!result.error){
      console.log("RESULT DATA: ", result.data)
      if(result.data){
        const servers: any = result.data;
        setServerList(servers);
        setServerListLength(servers.length)
      }
    }
  };

  function setScreenToDm(){
    setCurrentScreen("DirectMessages")
    setCurrentServer(null)
  }

  // console.log("item.id + item.picture of first: " + serverList[1].id + serverList[1].picture)
  let serverListItems = serverList.map((item: ServerMetadata) => <ServerButton key={item.name + item.creator_address} metadata={item}/>);

  return(
    <>
      <div className="flex relative">
        <div id="no-scrollbar" className="w-20 overflow-y-scroll shrink-0 pb-20 pt-[132px] overflow-hidden">
          <div className="p-1 absolute top-2 left-3">
            <div className="flex flex-col gap-1.5">
              <button 
                className="flex flex-col w-12 h-12 p-2.5 bg-deep-purple-300 rounded-xl justify-center place-items-center duration-200 hover:scale-105 z-10 select-none"
                onClick={setScreenToDm}
              >
                <img src={messageBubble} height={35} width={35}/>
              </button>
              <OptionsMenuButton/>
            </div>
          </div>
          {serverListItems}
          <div className="p-1 absolute bottom-2 left-3">
            <ProfileControls/>
          </div>
        </div>
        {/* FIX BELOW SO NOT SUPER SPECIFIC WITH THE DIMENSIONS BASED ON OTHER SCREENS */}
        <div className="overflow-hidden absolute top-0 w-20 h-52 select-none pointer-events-none">
          <div className="absolute top-0 w-20 bg-off-black-700 border-b-2 border-off-black-400 h-[126px] shadow-off-black-700 shadow-lg"/>
        </div>
        <div className="overflow-hidden absolute bottom-0 w-20 h-52 select-none pointer-events-none">
          <div className="absolute bottom-0 w-20 bg-off-black-700 border-t-2 border-off-black-400 h-[72px] shadow-[0px_-10px_15px_-3px_rgba(0,0,0,0.1)] shadow-off-black-700"/>
        </div>
      </div>
    </>
  )
}