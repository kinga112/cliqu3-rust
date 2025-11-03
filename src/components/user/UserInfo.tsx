import { ChatMemberProfile, IUser, UserProfile } from "@pushprotocol/restapi/src";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../state-management/userStore";
import star from '../../assets/icons/star.svg'
import block from '../../assets/icons/block.svg'
import unblock from '../../assets/icons/unblock.svg'
import { UserInfoEditable } from "./UserInfoEditable";
import { push } from "../../push";
// import { push } from "../../push";

export function UserInfoSmall(props: {member: ChatMemberProfile}){
  // const creator = useServerStore((server) => server.creator)
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // const blockedList = userProfile.blockedUsersList
  // console.log("CREATOR: ", creator)
  // console.log("USER ADDRESS: ", props.member.address)


  const handleClick = (e: React.MouseEvent) => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleCloseMenu();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);


  let displayName = ''
  if(props.member.userInfo.profile.name != null){
    displayName = props.member.userInfo.profile.name
  }else{
    // displayName = props.member.address
    try{
      if(props.member.address.split(':')[1] != undefined){
        displayName =  props.member.address.split(':')[1].toLowerCase()
      }
    }catch{
      // console
    }
  }


  // function IsCreator(){
  //   const [creatorTagVisibility, setCreatorTagVisibility] = useState('invisible')
  //   if(props.member.address.toLowerCase().includes(creator)){
  //     return(
  //       <>
  //         <div className="relative">
  //           <img 
  //             onMouseEnter={() => setCreatorTagVisibility('visible')} 
  //             onMouseLeave={() => setCreatorTagVisibility('invisible')} 
  //             src={star} width={25} height={25}
  //           />
  //           <div className={"absolute p-1 rounded text-deep-purple-100 bg-off-black-300 -right-5 font-medium border border-off-black-200 " + creatorTagVisibility}>
  //             creator
  //           </div>
  //         </div>
  //       </>
  //     )
  //   }
  // }

  return(
    <>
      <div className="relative">
        <button onClick={(e) => handleClick(e)} className="flex place-items-center gap-1 hover:bg-deep-purple-300 rounded w-full p-2">
          <img className="rounded-sm object-cover w-6 h-6 select-none" src={props.member.userInfo.profile.picture!}/>
          <p className="truncate">{displayName}</p>
          {/* <IsCreator/> */}
        </button>
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute shadow-lg w-96 h-36 bg-slate-400 rounded-xl top-0 -left-[calc(395px)] z-50"
          >
            {/* <UserInfoLarge 
              address={props.member.address.toLowerCase()}
              displayName={props.member.userInfo.profile.name!} 
              description={props.member.userInfo.profile.desc!} 
              picture={props.member.userInfo.profile.picture!} 
              edit={false}
            /> */}
            <UserInfoLarge 
              address={props.member.address.toLowerCase()}
              userProfile={props.member.userInfo.profile}
            />
          </div>
        )}
      </div>
    </>
  )
}

// export function UserInfoLarge(props: {address: string, displayName: string, description: string, picture: string, edit: boolean}){
export function UserInfoLarge(props: {address: string, userProfile: UserProfile}){
  const [showCopy, setShowCopy] = useState(false)
  const [copyText, setCopyText] = useState('copy')
  // const push = useUserStore((user) => user.pushApi)
  // const address = useUserStore((user) => user.address)
  const profile = useUserStore((user) => user.profile)
  const setProfile = useUserStore((user) => user.setProfile)
  // const [blocked, setBlocked] = useState(false)
  
  


  let blocked = false
  let address = ''
  if(props.address){
    address = props.address.toLowerCase()
    try{
      if(props.address.split(':')[1] != undefined){
        address = props.address.split(':')[1].toLowerCase()
      }
    }catch{
      // console
    }
  }

  // let user = profile

  if(profile){
    if(profile!.blockedUsersList!.includes(props.address.toLowerCase())){
      console.log("THIS USER IS BLOCKED")
      blocked = true
    }
  }

  // console.log("account: " + push.user!.account + ", address: " + address)
  let myProfile = false
  if(address.includes(address)){
    myProfile = true
  }

  let visibility = 'invisible'
  if(showCopy){
    visibility = 'visible'
  }

  // function blockUser(){
  //   push!.chat.block([address]).then((user: IUser) => {
  //     // console.log("BLOCKED USER: ", user)
  //     // console.log("PROFILE: ", user)
  //     const newBlockedUsersList = user.profile.blockedUsersList
  //     newBlockedUsersList!.push(address)
  //     const newProfile: UserProfile = {
  //       name: user.profile.name,
  //       desc: user.profile.desc,
  //       picture: user.profile.picture,
  //       profileVerificationProof: user.profile.profileVerificationProof,
  //       blockedUsersList: newBlockedUsersList
  //     }
  //     setProfile(newProfile)
  //   })
  // }
  
  // async function unblockUser(){
  //   push!.chat.unblock([address]).then((user: IUser) => {
  //     // console.log("Unblocked USER: ", user.profile)
  //     const newBlockedUsersList = user.profile.blockedUsersList!.filter(item => item !== address);
  //     const newProfile: UserProfile = {
  //       name: user.profile.name,
  //       desc: user.profile.desc,
  //       picture: user.profile.picture,
  //       profileVerificationProof: user.profile.profileVerificationProof,
  //       blockedUsersList: newBlockedUsersList
  //     }
  //     setProfile(newProfile)
  //   })
  // }

  return(
    <>
      {/* { props.edit ? */}
        {/* <UserInfoEditable address={address} displayName={props.displayName} description={props.description} picture={props.picture}/> : */}
        <div className="relative w-96 h-36 rounded-xl overflow-hidden pointer-events-none z-50">
          <img className="absolute w-full h-full blur-3xl select-none" src={props.userProfile!.picture!}/>
          <div className="absolute flex p-4 gap-4 place-items-center w-full h-full text-left">
            <img className="w-28 h-28 rounded-lg shrink-0 object-cover select-none" src={props.userProfile!.picture!}/>
            <div className="h-28 w-full p-2 rounded-lg bg-deep-purple-100 text-deep-purple-500 bg-opacity-50">
              <div className="flex flex-col gap-0.5 pointer-events-auto">
                <p className="text-xl font-semibold line-clamp-1 text-ellipsis">{props.userProfile!.name}</p>
                {/* <div className="relative">
                  <button 
                    className="text-xs hover:underline"
                    onClick={() => {navigator.clipboard.writeText(address); setCopyText('copied')}}
                    onMouseEnter={() => setShowCopy(true)}
                    onMouseLeave={() => {setShowCopy(false); setCopyText('copy')}}
                  >
                    {address.substring(0,12)}...{address.substring(30,42)}
                  </button>
                  <div className={"absolute top-6 left-0 bg-deep-purple-500 text-deep-purple-100 rounded text-sm p-0.5 " + visibility}>
                    {copyText}
                  </div>
                </div> */}
                <p className="text-base font-light line-clamp-2 text-ellipsis">{props.userProfile!.desc}</p>
                { profile ? 
                  <div className="relative">
                    <button 
                      className="text-xs hover:underline"
                      onClick={() => {navigator.clipboard.writeText(address); setCopyText('copied')}}
                      onMouseEnter={() => setShowCopy(true)}
                      onMouseLeave={() => {setShowCopy(false); setCopyText('copy')}}
                    >
                      {address.substring(0,12)}...{address.substring(30,42)}
                    </button>
                    <div className={"absolute top-6 left-0 bg-deep-purple-500 text-deep-purple-100 rounded text-sm p-0.5 " + visibility}>
                      {copyText}
                    </div>
                  </div>
                  : <div className="text-xs">{address.substring(0,12)}...{address.substring(30,42)}</div>
                }
              </div>
            </div>
          </div>
          { myProfile ? 
            <div/> :
              blocked ?
                <button className="absolute flex justify-center bottom-5 right-5 bg-deep-purple-100 rounded-lg z-50 pointer-events-auto hover:bg-deep-purple-200" onClick={() => push.unblockUser}>
                  <img className="w-8 h-8" src={unblock}/>
                </button> :
                <button className="absolute bottom-5 right-5 p-1 bg-deep-purple-100 rounded-lg z-50 pointer-events-auto hover:bg-deep-purple-200" onClick={() => push.blockUser}>
                  <img className="w-6 h-6" src={block}/>
                </button>
          }
        </div>
      {/* } */}
    </>
  )
}
