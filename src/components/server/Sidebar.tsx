import { JSX, useEffect, useRef, useState } from "react"
import carrot from "../../assets/icons/carrot.svg"
import { TextChannelButton } from "./TextChannelButton";
import { VoiceChannelButton } from "./VoiceChannelButton";
import { useGlobalStore } from "../../state-management/globalStore";
import { tryCatch } from "../../tryCatch";
import { invoke } from "@tauri-apps/api/core";
// import { TextChannel } from "../../types/serverTypes";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { push } from "../../push";
import { TextChannel } from "../../types/serverTypes";

export function SideBar(){
//   const serverName = useServerStore((server) => server.name)
//   const serverId = useServerStore((server) => server.serverId)
//   const creator = useServerStore((server) => server.creator)
//   const [textChannels, setTextChannels] = useState<TextChannel[]>([])
//   const [voiceChannels, setVoiceChannels] = useState<{[chatId: string] : VoiceChannel}>({})
//   const [openVideo, setOpenVideo] = useState(false)
//   const [showTextChannels, setShowTextChannels] = useState(true)
//   const [showVoiceChannels, setShowVoiceChannels] = useState(true)
  const [showInviteUserModal, setShowInviteUserModal] = useState(false)
  const [showServerMenu, setShowServerMenu] = useState(false)
  const serverNameButtonRef = useRef(null)
  const [showCopy, setShowCopy] = useState(false)
  const [copyText, setCopyText] = useState('copy')
//   const currentTextChannel = useServerStore((server) => server.currentTextChannel)
//   const serverTextChannels = useServerStore((server) => server.textChannels)
//   const serverVoiceChannels = useServerStore((server) => server.voiceChannels)
//   const appendVoiceChannel = useServerStore((server) => server.appendVoiceChannel)
//   const callStream = useCallStore((call) => call.stream)

// const [metadata, setMetadata] = useState();
const currentServer = useGlobalStore((globals) => globals.currentServer);
const [showTextChannels, setShowTextChannels] = useState(true);
const [showVoiceChannels, setShowVoiceChannels] = useState(true);

console.log("current server inside sidebar: ", currentServer);

let visibility = 'invisible'
if(showCopy){
  visibility = 'visible'
}
//   let isCreator = false
//   if(push.user!.account.toLowerCase() == creator){
//     isCreator = true
//   }

  // useEffect(() => {
  //   console.log('USE EFFECT SIDE BAR:');
  // }, [])

//   let textChannelItems = serverTextChannels.map((channel: TextChannel) => <ChatChannelButton key={channel.chatId} name={channel.name} chatId={channel.chatId} unread={channel.unread}/>);

//   let voiceChannelItems: JSX.Element[] = []
//   for (let key in serverVoiceChannels) {
//     let voiceChannel = serverVoiceChannels[key];
//     voiceChannelItems.push(<UpdatedVoiceChannelButton key={voiceChannel.chatId} name={voiceChannel.name} chatId={voiceChannel.chatId}/>)
//     // Use `key` and `value`
//   }

  async function getInviteCode(){
    console.log("getting invite code for", currentServer!.metadata.ticket)
    // const result = await tryCatch(invoke("invite", { id: currentScreen?.metadata.id }));
    // if(!result.error){
    //   console.log("RESULT DATA: ", result.data)
    // }
  }

  let textChannelArrow = ''
  let voiceChannelArrow = ''
  if(showTextChannels == false){
    textChannelArrow = ' -rotate-90'
  }
  if(showVoiceChannels == false){
    voiceChannelArrow = ' -rotate-90'
  }

  console.log("current server:", currentServer)
  
  const textChannels = currentServer!.textChannels.map((textChannel: TextChannel) => {
    return <TextChannelButton name={textChannel.name} chatId={textChannel.chatId}/>
  })

  let voiceChannels: JSX.Element[] = []
  for (let key in currentServer!.voiceChannels) {
    let voiceChannel = currentServer!.voiceChannels[key];
    voiceChannels.push(
      <VoiceChannelButton 
        key={key} 
        ticket={currentServer!.metadata.ticket} 
        id={key} name={voiceChannel.name} 
        active_users={voiceChannel.active_users}
      />
    )
  }

  function InviteUserModal(){
    // const ticket = `${currentServer!.metadata.ticket.substring(0,12)}...${currentServer!.metadata.ticket.substring(currentServer!.metadata.ticket.length-12,currentServer!.metadata.ticket.length)}`
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // console.log("EVENT: " + event.target.value);
      setInput(event.target.value)
    }
    
    async function sendTicket(){
      console.log("sending ticket to:", input)
      const msg = await push.api!.chat.send(input, {
        content: currentServer!.metadata.ticket,
        type: 'Text',
      });
    }
    
    return(
      <>
        <Dialog open={showInviteUserModal} onClose={() => {setShowInviteUserModal(false)}} className="relative z-50 text-deep-purple-100 select-none">
          <div className="fixed inset-0 flex w-screen items-center justify-center">
            <DialogPanel className="flex flex-col w-[500px] space-y-1 bg-deep-purple-400 p-12 rounded-md place-items-center">
              <DialogTitle className="flex font-extralight text-5xl w-full py-5 justify-center">Invite User</DialogTitle>
              <input ref={inputRef} value={input} onChange={handleInputChange} className="w-80 border-2 border-deep-purple-100 rounded p-1" placeholder="User Wallet Address to Send Ticket" />
              <button onClick={sendTicket} className="w-16 h-8 rounded bg-deep-purple-100 text-deep-purple-300 hover:text-deep-purple-400 font-semibold text-lg">Send</button>
              {/* <div>
                Send invite code to user:
              </div>
              <div className="relative">
                <button 
                  className="select-text hover:underline"
                  onClick={() => {navigator.clipboard.writeText(currentServer!.metadata.ticket); setCopyText('copied')}}
                  onMouseEnter={() => setShowCopy(true)}
                  onMouseLeave={() => {setShowCopy(false); setCopyText('copy')}}
                >
                  {ticket}
                </button>
                <div className={"absolute top-6 left-0 bg-deep-purple-500 text-deep-purple-100 rounded text-sm p-0.5 " + visibility}>
                  {copyText}
                </div>
              </div> */}
            </DialogPanel>
          </div>
        </Dialog>
      </>
    )
  }

  // const userAddress = push.user!.account.toLowerCase()

  function ServerMenu(){
    const menuRef = useRef(null)
    outsideMenuAlerter(menuRef, serverNameButtonRef)

    function outsideMenuAlerter(menuRef: React.MutableRefObject<any>, serverNameButtonRef:React.MutableRefObject<any>) {
      useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if(!serverNameButtonRef.current.contains(event.target)){
            if (!menuRef.current.contains(event.target)) {
              setShowServerMenu(false)
            }
          }
          // if (!menuRef.current.contains(event.target)) {
          //   setShowServerMenu(false)
          // }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [menuRef, serverNameButtonRef]);
    }


    if(showServerMenu){
      return(
        <>
          <div ref={menuRef} className="absolute top-16 left-2 w-52 bg-off-black-400 border border-off-black-300 rounded flex flex-col gap-1 p-2">
            <button className="bg-deep-purple-300 hover:bg-deep-purple-400 text-start p-2 rounded" onClick={() => {setShowInviteUserModal(true); setShowServerMenu(false)}}>Invite User</button>
            <button className="bg-deep-purple-300 hover:bg-deep-purple-400 text-start p-2 rounded">Server Settings</button>
          </div>
        </>
      )
    }
  }
  
  return(
    <>
      <div key={""} className="w-56 bg-off-black-600 border-r-1 border-off-black-400 shrink-0">
        <div className="relative">
          <button
            // ref={serverNameButtonRef}
            className="flex justify-between w-full h-14 z-10 border-b border-off-black-700 place-items-center px-2 shadow-md shadow-off-black-700 text-xl font-light"
            onClick={() => setShowServerMenu(!showServerMenu)}
            // onClick={getInviteCode}
            >
            {currentServer!.metadata.name}
            {/* {
              showServerMenu ?
              <img src={close} width={35} height={35} /> :
              <img src={carrot} width={35} height={35} />
            } */}
          </button>
          <ServerMenu/>
          <InviteUserModal/>
        </div>
        <div key={""} className="flex flex-col gap-5 overflow-y-auto py-5">
          <div className="flex flex-col gap-1">
            <div className="px-1 flex flex-row place-items-center justify-between group pointer-events-none">
              <div className="flex place-items-center">
                <img className={textChannelArrow} src={carrot} width={20} height={20}/>
                <button className="p-1 group-hover:text-deep-purple-200 group-hover:underline pointer-events-auto" onClick={() => setShowTextChannels(!showTextChannels)}>
                  Text Channels
                </button>
              </div>
              {/* {isCreator ? 
                <button className="w-6 h-6 rounded-md hover:bg-off-black-200 pointer-events-auto" onClick={() => {_openCreateChatChannelModal.set(true)}}>
                  <img src={add}/>
                </button>
              : <div/>  
              } */}
            </div>
            { showTextChannels ?
            // <div>{textChannels}</div> : <TextChannelButton name={currentScreen?.text_channels[0]!}/>
            <div>{textChannels}</div> : <TextChannelButton name={currentServer!.textChannels[0].name} chatId={currentServer!.textChannels[0].chatId}/>
            }
            {/* {currentScreen!.text_channels} */}
          </div>
          {/* <VoiceChannelButton name={'voice_test'} /> */}
          <div className="flex flex-col gap-1">
            <div className="px-1 flex flex-row place-items-center justify-between group pointer-events-none">
              <div className="flex place-items-center">
                <img className={voiceChannelArrow} src={carrot} width={20} height={20}/>
                <button className="p-1 group-hover:text-deep-purple-200 group-hover:underline pointer-events-auto" onClick={() => setShowVoiceChannels(!showVoiceChannels)}>
                  Voice Channels
                </button>
              </div>
              {/* {isCreator ? 
                <button className="w-6 h-6 rounded-md hover:bg-off-black-200 pointer-events-auto" onClick={() => {_openCreateChatChannelModal.set(true)}}>
                  <img src={add}/>
                </button>
                : <div/>  
              } */}
            </div>
            { showVoiceChannels ?
            <div>{voiceChannels}</div> : <div/>
            }
          </div>
          {/* {callStream.meta.initiator.address != null ? <AudioPlayer stream={callStream.local.stream} isMuted={false} user={callStream.local.address}/> : <div/>} */}
          {/* {incomingAudioUsers} */}
          {/* <VideoModal/> */}
          {/* <button onClick={() => setOpenVideo(true)}> open video </button> */}
        </div>
        {/* <AddChannelModal/> */}
      </div>
    </>
  )
}
