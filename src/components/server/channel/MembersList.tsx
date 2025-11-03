import { ChatMemberProfile } from "@pushprotocol/restapi"
import { useState } from "react"
import { useServerStore } from "../../../state-management/serverStore"
import { UserInfoSmall } from "../../user/UserInfo"
import carrot from "../../../assets/icons/carrot.svg"

export function MembersList(){
  const [showAdmins, setShowAdmins] = useState(true)
  const [showMembers, setShowMembers] = useState(true)
  const users = useServerStore((server) => server.users)
  
  let adminsArrow = ''
  if(showAdmins == false){
    adminsArrow = '-rotate-90'
  }

  let membersArrow = ''
  if(showMembers == false){
    membersArrow = '-rotate-90'
  }

  const adminList = users.admins.map((member: ChatMemberProfile) => {return <UserInfoSmall key={member.address} member={member}/>})
  const memberList = users.members.map((member: ChatMemberProfile) => {return <UserInfoSmall key={member.address} member={member}/>})

  return(
    <>
      {/* <div className="flex flex-col w-48 border-l-2 border-deep-purple-300 shrink-0 px-2 text-deep-purple-100"> */}
      <div className="flex flex-col z-10 w-48 bg-off-black-500 border-l-2 border-off-black-400 shrink-0 px-2 text-deep-purple-100">
        <button className="flex flex-row text-sm pt-2 select-none group pointer-events-none place-items-center select" onClick={() => setShowAdmins(!showAdmins)}>
          <img className={'pointer-events-auto ' + adminsArrow} src={carrot} width={20} height={20}/>
          <div className="group-hover:underline pointer-events-auto">admins</div>
          <div className="group-hover:underline pointer-events-auto">&nbsp;-&nbsp;{adminList.length}</div>
        </button>
        { showAdmins ? <div>{adminList}</div> : <div/> }
        {memberList.length != 0 ?
        <div>
          <button className="flex flex-row text-sm pt-2 select-none group pointer-events-none place-items-center select" onClick={() => setShowMembers(!showMembers)}>
          <img className={'pointer-events-auto ' + membersArrow} src={carrot} width={20} height={20}/>
          <div className="group-hover:underline pointer-events-auto">members</div>
          <div className="group-hover:underline pointer-events-auto">&nbsp;-&nbsp;{memberList.length}</div>
        </button>
        { showMembers ? <div>{memberList}</div> : <div/> }
        </div>
        :
        <div/>
        }
      </div>
    </>
  )
}