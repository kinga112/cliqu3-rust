// import { UserProfile } from "@pushprotocol/restapi"
import { IFeeds, UserProfile } from "@pushprotocol/restapi/src";
// import { cache2 } from "../../../dexie"
// import { getNewMessages } from "../../../helperFunctions/fetch"
import { useGlobalStore } from "../../../state-management/globalStore"
import { useServerStore } from "../../../state-management/serverStore"
import { useUserStore } from "../../../state-management/userStore"
import { useDirectMessageStore } from "../../../state-management/dmStore"
import { push } from "../../../push";

// export function DirectMessageNavButton(props: {chat: IFeeds}){
// changed to any because IFeeds does not actually match the type
export function DirectMessageNavButton(props: {chat: any}){
  const setUserProfiles = useServerStore((server) => server.setUserProfiles)
  const setMessages = useServerStore((server) => server.setMessages)
  // const setUserProfiles = useServerStore((server) => server)
  const profile = useUserStore((user) => user.profile)
  // const currentDM = useGlobalStore((globals) => globals.currentDM)
  // const setCurrentDM = useGlobalStore((globals) => globals.setCurrentDM)
  const currentDM = useDirectMessageStore((dm) => dm.currentDM)
  const setCurrentDM = useDirectMessageStore((dm) => dm.setCurrentDM)
  const setNewMessage = useDirectMessageStore(dm => dm.setNewMessage)
  const clearMessages = useServerStore(server => server.clearMessages)

  async function changeDM(){
    console.log("change dm")
    // console.log("CHANGE DM: " + props.chat.chatId + ", currentDM: " + currentDM)
    // console.log("CHANGING SERVER SERVER IDDDDDD: " + props.server.id)
    setNewMessage(false)
    if(props.chat.chatId != currentDM!){
      clearMessages()
      setCurrentDM(props.chat.chatId!)
      // console.log("NO EQUAL setting current dm to: ", props.chat.chatId)
      const chatInfo = await push.api!.chat.info(props.chat.chatId!)
      // console.log("CHAT INFO: ", chatInfo)
      if(chatInfo?.meta.group){
        console.log("GROUP DM")
      }else{
        let profiles: { [address: string]: UserProfile } = {}
        profiles[push.api!.account.toLowerCase()!] = profile!
        // let myProfile = 
        // await push.user?.profile.info({overrideAccount: chatInfo?.recipient}).then((info: any) => {
        //   const recipient = chatInfo?.recipient.split(':')[1].toLowerCase()!
        //   console.log("RECIPIENT: ", recipient)
        //   profiles[recipient] = info
        // })
        
        const recipient = chatInfo?.recipient.split(':')[1].toLowerCase()!
        const recipientProfile = await push.api!.profile.info({overrideAccount: chatInfo?.recipient})
        profiles[recipient] = recipientProfile
        // console.log("PROFILES: ", profiles)
        setUserProfiles(profiles)
      }
      // const cachedMessages = await cache2.fetchRecentMessages(props.chat.chatId!)
      // setMessages(cachedMessages)
      // console.log("fetched all cached dms!")
      // const messages = await push.user?.chat.history(props.chatId, { limit: 30 })
      // setMessages(messages)
      // await getNewMessages(props.chat.chatId!)
      console.log('getting new messages')
      await push.getNewMessages(props.chat.chatId!)
    }
  }

  let imageContent = false
  let messageContent = ''
  // console.log("msg:", props.chat.msg)
  if(props.chat.msg.messageType == 'MediaEmbed'){
    imageContent = true
  }
  // if(props.chat.msg.messageObj == "MessageType Not Supported by this sdk version. Plz upgrade !!!"){
  //   props.chat.msg.messageObj?.content
  // }
  if(typeof props.chat.msg.messageObj.content === "string"){
    messageContent = props.chat.msg.messageObj.content
  }else{
    // console.log("PROPS.MESSAGE.MESSAGE.CONTENT: ", props.message.message.content)
    // console.log("ELSE: ", props.message.message.content)
      // console.log("FIRST MESSAGE THINF YEAH:::", props.message.message.content)
    if(typeof props.chat.msg.messageObj?.content?.messageObj?.content === "string"){
      messageContent = props.chat.msg.messageObj.content.messageObj.content
    }
    // messageContent = props.message.message.content.messageObj
    // console.log("CONTENT TYPE OF REPLY TYPE: " + message.message.content.type)
    // console.log("MESSAGE REPLY: ", props.message.message)
  }

  // console.log("MESSAGE CONTENT:", messageContent)

  let from = props.chat.did.split(':')[1].toLowerCase()
  if(props.chat.name){
    from = props.chat.name
  }

  return(
    <>
      <button onClick={changeDM} className="bg-off-black-500 px-2 py-1 w-full shrink hover:bg-off-black-400 rounded-lg">
        <div className="flex gap-4 place-items-center">
          <img className="w-12 h-12 rounded-md shrink-0 object-cover select-none" src={props.chat.profilePicture!} />
          <div className="flex flex-col gap-[1px] items-start w-32">
            <p className="truncate w-full text-xl">{from}</p>
            <p className="truncate font-light w-full text-white text-opacity-50">{messageContent}</p>
            <Time timestamp={props.chat.msg.timestamp!} />
          </div>
        </div>
      </button>
    </>
  )
}


function Time(props: {timestamp: number}){
  const now = new Date();
  const time = new Date(props.timestamp)
  let timeString = new Intl.DateTimeFormat('en-US', {month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(props.timestamp)
  if(now.getMonth() == time.getMonth() && now.getDate() == time.getDate() && now.getFullYear() == time.getFullYear()){
    timeString = new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: '2-digit'}).format(props.timestamp)
  }
 
  return(
    <>
      <p className="text-sm font-light text-white text-opacity-50">{timeString}</p>
    </>
  )
}