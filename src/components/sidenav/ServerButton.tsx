import { useEffect, useState } from "react"
import { useGlobalStore } from "../../state-management/globalStore";
import { ServerMetadata, ServerType } from "../../types/serverTypes";
import { tryCatch } from "../../tryCatch";
import { invoke } from "@tauri-apps/api/core";


// export type Server = {
//   name: string,
//   creator_address: string,
// }

export function ServerButton(props: {metadata: ServerMetadata }){
  const setCurrentScreen = useGlobalStore((globals) => globals.setCurrentScreen);
  const currentScreen = useGlobalStore((globals) => globals.currentScreen);
  
  let active = false;

  if(currentScreen?.metadata.id == props.metadata.id){
    active = true;
  }

  let visibility = 'invisible h-2 w-0 group-hover:h-5 group-hover:w-3 group-hover:visible'
  if(active){
    visibility = 'visible h-10 w-3'
  }

  async function fetchServer() {
    const result = await tryCatch(invoke("get_server", {id: props.metadata.id}));
    if(!result.error){
      console.log("Fetched server: ", result.data)
      const server: any = result.data;
      setCurrentScreen(server)
    }
  }

  async function setServer(){
    if(!active){
      await fetchServer();
      const result = await tryCatch(invoke("set_current_server", {id: props.metadata.id}));
      if(!result.error){
        console.log("RESULT DATA: ", result.data);
      }
    }
  };

  function Button(){
    const buttonStyle = `
      flex flex-col w-16 h-16 bg-deep-purple-300 rounded-2xl 
      justify-center place-items-center duration-200 hover:scale-105 
      ml-4 shrink-0 overflow-hidden select-none`

      if(props.metadata.pic == ""){
        let serverInitials = "";
        const wordList = props.metadata.name.split(' ')
        let i = 0
        for(i; i < wordList.length; i++){
          if(wordList){
            serverInitials = serverInitials + wordList[i].charAt(0).toUpperCase()
          }
          if(i == 4){
            break;
          }
        }
        return(
          <>
            <button onClick={setServer} className={buttonStyle}>
              {serverInitials}
            </button>
          </>
        )
      }else{
        return(
          <>
            <button onClick={setServer} className={buttonStyle}>
              <img className="object-cover w-16 h-16 rounded-2xl" src={props.metadata.pic} />
            </button>
          </>
        )
      }
  }

  return(
    <>
      <div className="pt-1.5">
        <div className="flex relative place-items-center group">
          <div className={"absolute -left-1.5 shrink-0 bg-deep-purple-100 rounded-full duration-300 " + visibility}/>
          <Button/>
        </div>
      </div>
    </>
  )
}

