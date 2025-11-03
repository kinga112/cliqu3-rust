import { useEffect, useRef, useState } from "react";
import add_cropped from "../../../assets/icons/add-cropped.svg"
import settings from "../../../assets/icons/settings.svg"
import options from "../../../assets/icons/options.svg"
import arrow from "../../../assets/icons/arrow.svg"
import { invoke } from "@tauri-apps/api/core";
import { tryCatch } from "../../../tryCatch";
import { useGlobalStore } from "../../../state-management/globalStore";
import { CreateServerModal } from "./CreateServerModal";

export function OptionsMenuButton(){
  const [optionsMenuVisibility, setOptionsMenuVisibility] = useState('invisible')
  const optionsMenuRef = useRef(null);
  const optionsMenuButtonRef = useRef(null);
  outsideOptionsMenuAlerter(optionsMenuRef, optionsMenuButtonRef);
  
  const setCurrentScreen = useGlobalStore(globals => globals.setCurrentScreen)
  const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer)
  const setShowCreateServerModal = useGlobalStore(globals => globals.setShowCreateServerModal)
  const showCreateServerModal = useGlobalStore(globals => globals.showCreateServerModal)

  // async function createServer(){
  //     const name = 'Star Wars!'
  //     const pic = ''
  //     const creatorAddress = '0x123456789'

  //   const result = await tryCatch(invoke("create_server", { name, pic, creatorAddress }))
  //   if(!result.error){
  //     console.log("Created Server: ", result.data)
  //   }else{
  //     console.log("FAIL")
  //   }
  // }

  function outsideOptionsMenuAlerter(optionsMenuRef: React.MutableRefObject<any>, optionsMenuButtonRef: React.MutableRefObject<any>) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (!optionsMenuButtonRef.current.contains(event.target)) {
          if (!optionsMenuRef.current.contains(event.target)) {
            setOptionsMenuVisibility('invisible')
          }
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [optionsMenuRef, optionsMenuButtonRef]);
  }

  function optionsMenuClick(){
    if(optionsMenuVisibility == 'visible'){
      setOptionsMenuVisibility('invisible')
    }else{
      setOptionsMenuVisibility('visible')
    }
  }

  async function joinServer(){
    console.log("joining server")
    const ticket = 'docaaacbswt375qqddyxwljhmawihsso7fmkxl467vemigs7ovw6tlgo6hqaf5hox34bqcnajpsnwhtzgxacdenmij5mlinoet6ucco7vpupedtcajinb2hi4dthixs65ltmuys2mjoojswyylzfzxdaltjojxwqltjojxwqltmnfxgwlrpauaauaaawgbksayajf3yhh4cvebqcjqbagbahaptgaaaaaaaaaadpi4dvebqcjqbagbahaptgcawdvnv2plygeudvebqcjqbagbahaptgcu6wb5e52jzh7udvebq';
    const result = await tryCatch(invoke("join_server", { ticket }));
    if(!result.error){
      console.log("RESULT DATA: ", result.data)
    }else{
      console.log("Error joining server:", result.error)
    }
  }

  function setScreenToSettings(){
    setCurrentScreen("Settings");
    setCurrentServer(null);
    setOptionsMenuVisibility('invisible');
  }

  const buttonStyle = `flex gap-2 p-2 place-items-center h-12 
  bg-deep-purple-300 rounded-lg hover:bg-deep-purple-400 select-none`

  return(
    <>
      <div className="flex flex-col relative">
        <button ref={optionsMenuButtonRef}
          className=" w-12 h-12 bg-deep-purple-300 rounded-xl justify-center place-items-center duration-200 hover:scale-105 z-10 overflow-visible select-none"
          onClick={optionsMenuClick}
        >
          <img src={options} height={75} width={75}/>
        </button>
        <div ref={optionsMenuRef} className={"absolute flex flex-col p-2 gap-1 left-[75px] w-32 bg-off-black-400 border border-off-black-300 rounded-2xl z-20 " + optionsMenuVisibility}>
          <button className={buttonStyle}
                  onClick={() => {setShowCreateServerModal(true); setOptionsMenuVisibility('invisible');}}
          >
            <img src={add_cropped} height={25} width={25}></img>
            <div className="font-semibold">Create</div>
          </button>
          <button className={buttonStyle}
                  onClick={joinServer}
          >
            <img className="-m-2 rotate-180" src={arrow} height={40} width={40}></img>
            <div className="font-semibold">Join</div>
          </button>
          <button className={buttonStyle}
            onClick={setScreenToSettings}
          >
            <img src={settings} height={25} width={25}></img>
            <div className="font-semibold">Settings</div>
          </button>
        </div>
        <CreateServerModal/>
      </div>
    </>
  )
}