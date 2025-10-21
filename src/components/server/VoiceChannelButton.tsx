import { invoke } from "@tauri-apps/api/core";
import volume from "../../assets/icons/volume.svg"
import { tryCatch } from "../../tryCatch";
import { useGlobalStore } from "../../state-management/globalStore";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export function VoiceChannelButton(props: { ticket: string, id: string, name: string, active_users: string[]}){
  let currentScreen = useGlobalStore(globals => globals.currentScreen);
  console.log("props active users:", props.active_users);
  const setCurrentVoiceChannel = useGlobalStore(globals => globals.setCurrentVoiceChannel);

  async function startCall(){
    if(props.active_users.length > 0){
      console.log("join call")
      joinCall();
    }else{
      console.log("start call: ", props.ticket, props.id, 'Test User 1')
      const user = "Test User 1";
      const result = await tryCatch(invoke("start_call", { serverId: currentScreen?.metadata.id, voiceChannelId: props.id, user }));
      if(!result.error){
        console.log("RESULT DATA: ", result.data)
      }
    }
    setCurrentVoiceChannel(props.id);
  }

  async function joinCall(){
    const user = "Test User 2";
    const result = await tryCatch(invoke("join_call", { serverId: currentScreen?.metadata.id, voiceChannelId: props.id, user }));
    if(!result.error){
      console.log("RESULT DATA: ", result.data)
    }
  }

  async function endCall(user: string){
    console.log("end call: ", props.ticket, props.id, user)
    const serverId = currentScreen?.metadata.id;
    const voiceChannelId = props.id;
    const result = await tryCatch(invoke("end_call", { serverId, voiceChannelId, user }));
    if(!result.error){
      console.log("RESULT DATA: ", result.data)
    }
    setCurrentVoiceChannel("");
  }

  const users = props.active_users.map((user: string) => {
    return (
      <div className="flex justify-between hover:bg-off-black-400 rounded-sm p-1 select-none">
        <div>
          {user.slice(0, 8)}
        </div>
        <button onClick={() => endCall(user)} className="w-20 rounded bg-deep-purple-300">End Call</button>
      </div>
    )
  })

  return (
    <>
      <div className="flex flex-col w-full border-deep-purple-300 overflow-y-auto px-2">
        <button className="flex w-full h-8 place-items-center p-1 hover:bg-off-black-400 rounded-lg" onClick={startCall}>
          <div className="flex flex-row gap-2 overflow-hidden place-items-center">
            <img src={volume} height={20} width={20}/>
            <p className="truncate">{props.name}</p>
          </div>
        </button>
        <div className="flex flex-col ml-7 pt-1 gap-1 justify-center">
          {users}
        </div>
      </div>
    </>
  )
}
