import { useState } from "react";
import { useServerStore } from "../../state-management/serverStore";
import { useUserStore } from "../../state-management/userStore";
import { push } from "../../push";
import { VoiceChannel } from "../../types/serverTypes";
import { useGlobalStore } from "../../state-management/globalStore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export function AddChannelModal(){
  // let [isOpen, setIsOpen] = useState(false)
//   const openModal = useHookstate(_openCreateChatChannelModal);
  // const serverId = useHookstate(_serverId);
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [textChannel, setTextChannel] = useState(true)

  // const serverId = useServerStore(state => state.serverId)
  const appendTextChannel = useServerStore(server => server.appendTextChannel)
  const appendVoiceChannel = useServerStore(server => server.appendVoiceChannel)
  const addChannelModalVisibility = useServerStore(server => server.addChannelModalVisibility)
  const setAddChannelModalVisibility = useServerStore(server => server.setAddChannelModalVisibility)
  const currentServer = useGlobalStore(globals => globals.currentServer)

  const profile = useUserStore(user => user.profile)
  // const appendCChannel = useServerStore((state) => state.append)

  // const [image, setChannelName] = useState('');
  const [showError, setShowError] = useState(false);
  // const push = useHookstate(_push);

  const handleChannelInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("EVENT: " + event.target.value);
    setChannelName(event.target.value)
  }

  const handleDescriptionInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("EVENT: " + event.target.value);
    setDescription(event.target.value)
  }
  
  let textColor = 'text-deep-purple-300'
  if(showError){
    textColor = 'text-red-500'
  }

  async function onChannelAdd(){
    if(channelName == ''){
      setShowError(true);
    }else{
      console.log("serverId: " + currentServer!.metadata.id)
      if(currentServer!.metadata.id != ''){
        console.log("ELSE IN CREATE CHANNEL MODAL:", textChannel)
        const newChatId = await push.createChannel(currentServer!.metadata.id, channelName, description, '', ['0xDEC4399dDb5655237Ee0cCBEe1B79273FDD3B465'], textChannel, !textChannel)
        if(newChatId != undefined){
          console.log("NEW CHAT ID: " + newChatId)
          if(textChannel){
            appendTextChannel({name: channelName, chatId: newChatId, unread: true})
          }else{
            // appendVoiceChannel({name: channelName, chatId: newChatId, peerInfo: ''})
            // appendVoiceChannel({name: channelName, chatId: newChatId, peerInfo: null})
            appendVoiceChannel({name: channelName, active_users: []})
          }
        }else{
          console.log("Chat Channel Creation FAILED!")
        }
      }
      setAddChannelModalVisibility(false);
      setShowError(false);
    }
  }

  return (
    <>
      {/* <button onClick={() => setIsOpen(true)}>Open dialog</button> */}
      <Dialog open={addChannelModalVisibility} onClose={() => {setAddChannelModalVisibility(false);setShowError(false);}} className="relative z-50 text-deep-purple-100 select-none">
        <div className="fixed inset-0 flex w-screen items-center justify-center">
          <DialogPanel className="flex flex-col max-w-lg space-y-1 bg-deep-purple-300 p-20 rounded-md">
            <DialogTitle className="font-light text-3xl">Create New Channel</DialogTitle>
            <button className="flex w-full bg-deep-purple-400 p-2 rounded-md justify-between place-items-center" onClick={() => setTextChannel(true)}>
              <div>Text Channel</div>
              <div className={"h-4 w-4 rounded-full border-2 border-deep-purple-100" + (textChannel ? ' bg-deep-purple-100' : ' bg-deep-purple-400')}/>
            </button>
            <button className="flex w-full bg-deep-purple-400 p-2 rounded-md justify-between place-items-center focus:" onClick={() => setTextChannel(false)}>
              <div>Voice Channel</div>
              <div className={"h-4 w-4 rounded-full border-2 border-deep-purple-100 " + (textChannel ? ' bg-deep-purple-400' : ' bg-deep-purple-100')}/>
            </button>
            <div className={textColor}>Channel name cannot be empty</div>
            <input className="w-full bg-deep-purple-400 p-2 rounded-md focus:outline-none placeholder:text-deep-purple-200" placeholder="enter channel name" onChange={handleChannelInputChange}/>
            <input className="w-full bg-deep-purple-400 p-2 rounded-md focus:outline-none placeholder:text-deep-purple-200" placeholder="enter description (optional)" onChange={handleDescriptionInputChange}/>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button className="bg-deep-purple-100 p-2 rounded-md text-deep-purple-300 font-bold shadow-md shadow-deep-purple-800 hover:shadow-none duration-100" onClick={() => {onChannelAdd()}}>Add</button>
              <button className="bg-deep-purple-100 p-2 rounded-md text-deep-purple-300 font-bold shadow-md shadow-deep-purple-800 hover:shadow-none duration-100 hover:text-red-500" onClick={() => {setAddChannelModalVisibility(false);setShowError(false);}}>Cancel</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
