import add from "../../../assets/icons/add-cropped.svg"
import { useDirectMessageStore } from "../../../state-management/dmStore"
import { useServerStore } from "../../../state-management/serverStore"
import { NavItems } from "./NavItems"

export function DirectMessagesNav(){
  const currentNavOption = useDirectMessageStore((dm) => dm.currentNavOption)
  const setCurrentNavOption = useDirectMessageStore((dm) => dm.setCurrentNavOptions)
  const setNewMessage = useDirectMessageStore(dm => dm.setNewMessage)
  const setCurrentDM = useDirectMessageStore(dm => dm.setCurrentDM)
  const setMessages = useServerStore(server => server.setMessages)

  function newDM(){
    setCurrentDM(null)
    setNewMessage(true)
    setMessages([])
  }

  let chatButtonStyle = 'p-2 w-full shrink hover:bg-off-black-400 rounded-lg'
  let requestButtonStyle = 'p-2 w-full shrink hover:bg-off-black-400 rounded-lg'
  if(currentNavOption == 'CHATS'){
    chatButtonStyle = 'p-2 w-full shrink bg-off-black-300 rounded-lg cursor-default'
  }else{
    requestButtonStyle = 'p-2 w-full shrink bg-off-black-300 rounded-lg cursor-default'
  }

  return(
    <>
      <div className="flex flex-col gap-2 w-56 shrink-0 bg-off-black-600">
        <div className="flex justify-between place-items-center h-14 border-b z-10 border-off-black-700 shadow-md shadow-off-black-700 shrink-0 p-2">
          <div className="text-2xl font-light">
            Direct Messages
          </div>
          <button className="bg-off-black-400 hover:bg-off-black-300 p-2 rounded-md" onClick={newDM}>
            <img src={add} width={15} height={15}/>
          </button>
        </div>
        <div className="flex flex-col p-2 gap-2">
          <div className="flex w-full h-12 gap-2">
            <button className={"text-bold " + chatButtonStyle} onClick={() => setCurrentNavOption('CHATS')}>
              Chats
            </button>
            <button className={"text-bold " + requestButtonStyle} onClick={() => setCurrentNavOption('REQUESTS')}>
              Requests
            </button>
          </div>
          <NavItems/>
        </div>
      </div>
    </>
  )
}
