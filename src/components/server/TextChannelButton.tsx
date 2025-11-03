import { useEffect, useState } from "react"
import hashtag from "../../assets/icons/hashtag.svg"
import { push } from "../../push"
import { ChatMemberProfile, GroupDTO, GroupInfoDTO } from "@pushprotocol/restapi"
import { useServerStore } from "../../state-management/serverStore"

export function TextChannelButton(props: {name: string, chatId: string}){
  // const [active, setActive] = useState(false)
  const [channelData, setChannelData] = useState<GroupDTO | GroupInfoDTO | undefined>(undefined)
  const currentTextChannel = useServerStore(server => server.currentTextChannel)
  const setCurrentTextChannel = useServerStore(server => server.setCurrentTextChannel)
  const setUsers = useServerStore(server => server.setUsers)
  const setUserProfiles = useServerStore(server => server.setUserProfiles)
  const clearMessages = useServerStore(server => server.clearMessages)

  let active = false
  if(currentTextChannel.chatId == props.chatId){
    active = true;
  }

  let buttonStyle = 'flex w-full h-8 place-items-center p-0.5 mb-0.5 hover:bg-off-black-400 rounded-lg'
  if(active){
    buttonStyle = 'flex w-full h-8 place-items-center p-0.5 mb-0.5 bg-deep-purple-300 rounded-lg'
  }

  useEffect(() => {
    fetchTextChannelData()
  }, [])

  async function fetchTextChannelData(){
    console.log("chatid:", props.chatId)
    const textChannelData = await push.api?.chat.group.info(props.chatId)
    console.log("textchannel data:", textChannelData)
    setChannelData(textChannelData)
  }

  function changeChannel(){
    if(currentTextChannel.chatId != props.chatId){
      clearMessages()
      setCurrentTextChannel({name: props.name, chatId: props.chatId})
      getUsers(props.chatId)
      push.getHistory(props.chatId)
    }
  }

  function getUsers(chatId: string){
      console.log("getting users:", props.chatId)
      push.api!.chat.group.participants.list(
        chatId,
        {
          filter: {
            role: 'admin',
            pending: false,
          },
        }
      ).then((admins: {members: ChatMemberProfile[]}) => {
        console.log("admins:", admins)
        push.api!.chat.group.participants.list(
          chatId,
          {
            filter: {
              role: 'member',
              pending: false,
            },
          }
        ).then((members: {members: ChatMemberProfile[]}) => {
          console.log("members:", members)
          // let userProfiles: Map<string, UserProfile>
          let userProfiles: any = {}
          admins.members.map((member: ChatMemberProfile) => {
            userProfiles[member.address.split(':')[1].toLowerCase()] = member.userInfo.profile
            // userProfiles.set(member.address, member.userInfo.profile)
          })
          members.members.map((member: ChatMemberProfile) => {
            userProfiles[member.address.split(':')[1].toLowerCase()] = member.userInfo.profile
            // userProfiles.set(member.address, member.userInfo.profile)
          })
          // console.log("USER PROFILES: " + JSON.stringify(userProfiles))
          setUserProfiles(userProfiles)
          setUsers({admins: admins.members, members: members.members})
          // console.log("USER INFO 0:::" + JSON.stringify(admins.members[0].userInfo.profile.))
        })
      })
    }

  return(
    <>
      <div className="w-full overflow-y-auto px-2">
        <button className={buttonStyle} onClick={changeChannel}>
          <div className="flex w-full justify-between">
            <div className="flex flex-row gap-2 overflow-hidden place-items-center">
              <img src={hashtag} height={20} width={20}/>
              <p className="truncate">{props.name}</p>
            </div>
            {/* <div className="flex place-items-center p-2">
              {props.unread ? <div className="flex place-items-center w-2 h-2 rounded-full bg-deep-purple-100"/> : <p/>}
            </div> */}
          </div>
        </button>
      </div>
    </>
  )
}
