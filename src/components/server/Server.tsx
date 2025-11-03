import { useEffect, useState } from "react";
import { SideBar } from "./Sidebar";
import { invoke } from "@tauri-apps/api/core";
import { tryCatch } from "../../tryCatch";
import { useGlobalStore } from "../../state-management/globalStore";
import { listen } from "@tauri-apps/api/event";
import { IrohServerType, ServerType, VoiceChannel } from "../../types/serverTypes";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChatChannel } from "./channel/ChatChannel";

// export default function Server(props: {metadata: {name: string, creator_address: string}}){
export default function Server(){
  // const [server, setServer] = useState<any>();
  const currentServer = useGlobalStore(globals => globals.currentServer)
  const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer)
  const setCurrentScreen = useGlobalStore(globals => globals.setCurrentScreen)

  useEffect(() => {
    // getCurrentWindow().onCloseRequested(async (event) => {
    //   event.preventDefault()
    //   // const currentVoiceChannel = useGlobalStore.getState().currentVoiceChannel;
    //   // if(currentVoiceChannel != "Settings"){
    //   //   const serverId = currentScreen!.metadata.id;
    //   //   const voiceChannelId = currentVoiceChannel;
    //   //   const user = 'Test User 1';
        
    //   //   console.log("voice id: ", voiceChannelId);
    //   //   console.log("server id: ", serverId);
    //   //   const result = await tryCatch(invoke("end_call", { serverId, voiceChannelId, user }));
    //   //   if(!result.error){
    //   //     console.log("RESULT DATA: ", result.data)
    //   //   }
    //   // }
    //   await getCurrentWindow().destroy();
    // });


    // listen to events streamed from tauri for updates on this server doc
    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        unlisten = await listen<any>("iroh_event", async (event) => {
          // const payload = JSON.parse(event.payload)
          // const eventData = JSON.parse(payload.event)
          const currentServer = useGlobalStore.getState().currentServer;
          console.log("Received iroh event:", event);
          console.log("current screen inside iroh event listener: ", currentServer);
          if(event.payload.data == "missing data"){
            console.log("MISSING DATA NEED TO RELOAD SERVER!:", currentServer?.metadata.id);
            const result = await tryCatch(invoke("get_server", {id: currentServer?.metadata.id}));
            if(!result.error){
              console.log("Fetched server: ", result.data)
              const server: any = result.data;
              setCurrentScreen(server)
            }else{
              console.log("Error ", result.error)
            }
          }else{
            const voiceChannels: { [id: string] : VoiceChannel } = event.payload.data;
            console.log("voice channels: ", voiceChannels)
            const server: ServerType = {
              metadata: currentServer!.metadata,
              currentTextChannel: currentServer!.currentTextChannel,
              textChannels: currentServer!.textChannels,
              voiceChannels: currentServer!.voiceChannels,
              messages: currentServer!.messages,
              reply: currentServer!.reply,
              files: currentServer!.files,
              currentVoiceChannel: currentServer!.currentVoiceChannel,
              users: currentServer!.users,
              userProfiles: currentServer!.userProfiles,
              addChannelModalVisibility: currentServer!.addChannelModalVisibility
            }
            // const server: ServerType = {
            //   creator_hash: currentServer!.creator_hash,
            //   metadata: currentScreen!.metadata,
            //   text_channels: currentScreen!.text_channels,
            //   voice_channels: voiceChannels
            // };
            console.log("updated server: ", server);
            setCurrentServer(server);
            setCurrentScreen('Server');
          }
        });
      } catch (err) {
        console.error("Failed to listen:", err);
      }
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [currentServer]);

  // useEffect(() => {
  //   eventListener()
  // }, []);

  // async function eventListener(){
  //   await listen<string>("iroh_event", (event) => {
  //     console.log("Received iroh event:", event.payload);
  //     // you could also update state here
  //   });
  // }

  // async function getServer(){
  //   const result = await tryCatch(invoke("get_server"));
  //   if(!result.error){
  //     console.log("RESULT DATA: ", result.data)
  //     const server: any = result.data;
  //     setServer(server);
  //   //   setServerList(servers);
  //   //   setServerListLength(servers.length)
  //   }
  // };

  return (
    <>
      <div className="flex h-full w-full bg-off-black-400">
        <SideBar/>
        <ChatChannel/>
      </div>
    </>
  )
}
