import { useEffect, useState } from "react"
import { useServerStore } from "../../../state-management/serverStore"
import { IFeeds } from "@pushprotocol/restapi/src"
// import { cache2 } from "../../../dexie"
import { DirectMessageNavButton } from "./DirectMessageNavButton"
import { useDirectMessageStore } from "../../../state-management/dmStore"
import loader from "../../../assets/icons/loader2.svg"
import { push } from "../../../push"

export function NavItems(){
  const currentNavOption = useDirectMessageStore(dm => dm.currentNavOption)
  const chats = useDirectMessageStore(dm => dm.chats)
  const requests = useDirectMessageStore(dm => dm.requests)
  const setChats = useDirectMessageStore(dm => dm.setChats)
  const setRequests = useDirectMessageStore(dm => dm.setRequests)
  // const [chats, setChats] = useState<IFeeds[]>([])
  // const [requests, setRequests] = useState<IFeeds[]>([])

  const [loading, setLoading] = useState(false);
  
  // useEffect(() => {
    // console.log("RUNNING NAV ITEMS")
    // setCurrentDM('')
    // clearMessages()
  // }, [currentNavOption])

  useEffect(() => {
    // console.log("FETCHING DMS")
    fetchChats()
  }, [currentNavOption])

  async function fetchChats(){
    console.log("chats:", chats)
    setLoading(true)
    let i = 1
    // let tempChatList: string[] = []
    // let tempRequestList: string[] = []
    let tempChatList: IFeeds[] = []
    let tempRequestList: IFeeds[] = []
    while(true){
      const fetched = await push.api!.chat.list(currentNavOption, {limit: 30, page: i})
      if(fetched.length == 0){
        break
      }
      i = i + 1
      // console.log("FETCHED " + currentNavOption + " FOR DM: ", fetched)
      fetched.map((chat: IFeeds) => {
        if(chat.groupInformation == undefined || chat.groupInformation?.groupDescription == 'GROUP DM'){
          // console.log("CHATTT 2: ", chat)
          // console.log('')
          if(currentNavOption == 'CHATS'){
            // console.log("before adding a chat, chats:", chats)
            // if(!chats.includes(chat.chatId!)){
            if(!chats.includes(chat)){
              // console.log("chat not inclusded: ", chat.chatId)
              // setChats([...chats, chat.chatId!])
              tempChatList.push(chat)
            }
          }else{
            // if(!requests.includes(chat.chatId!)){
            if(!requests.includes(chat)){
              // setRequests([...requests, chat.chatId!])
              tempRequestList.push(chat)
            }
          }
          // cache2.addChannel({
          //   chatId: chat.chatId!,
          //   name: chat.name!,
          //   users: [],
          //   lastReadMessageCid: ""
          // })
        }
      })
    }
    // maybe leaving this here or adding push on each iteration on first load when using app
    if(tempChatList.length > 0){
      setChats(tempChatList.reverse())
      setRequests(tempRequestList.reverse())
    }
    setLoading(false)
  }

  async function acceptChat(chatId: string){
    const response = await push.api!.chat.accept(chatId)
    let tempRequests: IFeeds[] = []
    requests.map((request: IFeeds) => {
      if(chatId != request.chatId){
        tempRequests.push(request)
      }
    })
    setRequests(tempRequests)
    // console.log("ACCPET CHAT RESPNSE: ", response)
  }

  async function rejectChat(chatId: string){
    const response = await push.api!.chat.reject(chatId)
    let tempRequests: IFeeds[] = []
    requests.map((request: IFeeds) => {
      if(chatId != request.chatId){
        tempRequests.push(request)
      }
    })
    setRequests(tempRequests)
    // console.log("REJECT CHAT RESPNSE: ", response)
  }

  // Return component based on CHATS or REQUESTS
  if(currentNavOption == 'CHATS'){
    // const navItems = chats.map((chat: IFeeds) => { return <DirectMessageNavButton key={chat.chatId!} chatId={chat.chatId!} did={chat.did}/>})
    // const navItems = chats.map((chatId: string) => { return <DirectMessageNavButton key={chatId} chatId={chatId}/>})
    const navItems = chats.map((chat: IFeeds) => { return <DirectMessageNavButton key={chat.chatId!} chat={chat}/>})
    return(
      <>
        <div className="flex flex-col gap-1 place-items-center w-full">
          <img 
            src={loader}
            className={`w-10 transition-all duration-200 animate-spin ${loading ? "h-10" : "h-0" }`}
          />
          { !loading && navItems.length == 0 ? <div>No Chats</div> : <div className="flex flex-col gap-1 w-full">{navItems}</div> }
        </div>
      </>
    )
  }if(currentNavOption == 'REQUESTS'){
    // const navItems = requests.map((chat: IFeeds) => { return <DirectMessageNavButton key={chat.chatId!} chatId={chat.chatId!} did={chat.did}/>})
    // const navItems = requests.map((chatId: string) => { return <DirectMessageNavButton key={chatId} chatId={chatId}/>})
    const navItems = requests.map((chat: IFeeds) => { 
      return <div className="flex flex-col gap-0.5">
        <DirectMessageNavButton key={chat.chatId} chat={chat}/>
        <div className="flex justify-end gap-1">
          <button className="p-1 rounded-lg hover:bg-green-900 bg-opacity-75" onClick={() => acceptChat(chat.chatId!)}>Accept</button>
          <button className="p-1 rounded-lg hover:bg-red-900 bg-opacity-75"  onClick={() => rejectChat(chat.chatId!)}>Reject</button>
        </div>
      </div>
    })
    return(
       <>
        <div className="flex flex-col gap-1 place-items-center w-full">
          <img 
            src={loader}
            className={`w-10 transition-all duration-200 animate-spin ${loading ? "h-10" : "h-0" }`}
          />
          { !loading && navItems.length == 0 ? <div>No Requests</div> : <div className="flex flex-col gap-1">{navItems}</div> }
        </div>
      </>
    )
  }
}
