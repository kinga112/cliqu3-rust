import { IFeeds, UserProfile } from "@pushprotocol/restapi/src";
import { useRef, useState } from "react";
import { useGlobalStore } from "../../state-management/globalStore";
import { useServerStore } from "../../state-management/serverStore";
import { Messages } from "../server/Messages";
import { UserInfoLarge } from "../user/UserInfo";
import { useDirectMessageStore } from "../../state-management/dmStore";
import close from "../../assets/icons/close.svg"
import { push } from "../../push";
import { BottomBar } from "../server/channel/BottomBar";

export default function NewDirectMessage(){
  const setCurrentTextChannel = useServerStore(server => server.setCurrentTextChannel)
  const setCurrentDM = useDirectMessageStore(dm => dm.setCurrentDM)
  const inputRef = useRef<HTMLInputElement>(null);
  const [recepientInfo, setRecipientInfo] = useState<'' | null | UserProfile>('');
  const [address, setAddress] = useState('')
  const [recipients, setRecipients] = useState<UserProfile[]>([])

  const handleRecepientChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("EVENT: " + event.target.value);
    if(!event.target.value){
      console.log("NULL")
      setRecipientInfo('')
    }else{
      push.api!.profile.info({overrideAccount: event.target.value}).then((info: UserProfile) => {
        console.log("INFO: ", info)
        setAddress(event.target.value)
        setRecipientInfo(info)
        // DM ONLY WORKS FOR 1 user right now... seends method to create group if more than one recipient and the get chatid and send message to that id
        // setCurrentDM()
      }).catch((error) => {
        console.log("ERROR::: " + error)
        setRecipientInfo(null)
      })
    }
  }

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>){
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      if(recepientInfo != '' && recepientInfo != null){
        console.log("ENTERING USER", recepientInfo)
        setRecipients([...recipients, recepientInfo])
        // setCurrentTextChannel({chatId: address, name: '', unread: false})
        setCurrentDM(address)
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setRecipientInfo('')
      }
    }
  }

  if(inputRef.current != null){
    inputRef.current.focus()
    inputRef.current.style.height = 'auto';  // Reset height to auto
  }

  const recipientProfiles = recipients.map((profile: UserProfile) => {
    return <UserDMItem profile={profile}/>
  })

  function removeUserDmItem(profile: UserProfile){
    setRecipients(recipients => 
      recipients.filter(recepient => recepient !== profile)
    );
  }

  function UserDMItem(props: {profile: UserProfile}){
    return(
      <>
        <div className="relative inline-flex items-center bg-off-black-300 rounded-md p-1 gap-1 group hover:bg-opacity-50">
          <img className="w-8 h-8 rounded shrink-0 object-cover select-none" src={props.profile.picture!} />
          <p className="whitespace-nowrap">{props.profile.name}</p>
          <button className="absolute top-0.5 right-0.5 hover:bg-red-900 rounded-full invisible group-hover:visible" onClick={() => removeUserDmItem(props.profile)}>
            <img className="w-5 h-5" src={close}/>
          </button>
        </div>
      </>
    )
  }

  return(
    <>
      <div className="relative flex flex-col overflow-hidden h-full w-full bg-off-black-500">
        <div className="flex gap-1 h-14 border-b z-10 p-2 border-off-black-700 justify-start shadow-md shadow-off-black-700 place-items-center">
          {recipientProfiles}
          {/* <input ref={inputRef} className="flex p-2 h-full w-full rounded-lg focus:outline-none bg-off-black-600" placeholder="Recipient Address" onKeyDown={handleKeyDown} onChange={handleRecepientChange}/> */}
          <input
            ref={inputRef}
            className="flex-1 p-2 h-full rounded-lg focus:outline-none bg-off-black-600 min-w-0"
            placeholder="Recipient Address - 'Enter' to select user"
            onKeyDown={handleKeyDown}
            onChange={handleRecepientChange}
          />
          { recepientInfo == '' ?
            <p/> : 
              recepientInfo ?
              <div className="absolute flex gap-2 top-[50px] p-2 bg-off-black-600 rounded-lg  ">
                <UserInfoLarge address={address} userProfile={recepientInfo}/>
              </div>
               : 
              <div className="absolute top-[50px] p-2 bg-off-black-600 rounded-md">User Not Found</div>
          } 
        </div>
        <div className="flex flex-col overflow-hidden h-full w-full">
          <Messages/>
          <BottomBar/>
        </div>
      </div>
    </>
  )
}
