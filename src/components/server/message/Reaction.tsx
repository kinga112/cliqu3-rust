import { useState } from "react";
import { useServerStore } from "../../../state-management/serverStore";
import { push } from "../../../push";

export function Reaction(props: {emoji: string, count: number, users: string[], cid: string, userProfiles: any}){
  const currentTextChannel = useServerStore((server) => server.currentTextChannel)
  // const userProfiles = useServerStore((server) => server.userProfiles)
  const addOrRemoveReaction = useServerStore((server) => server.addOrRemoveReaction)

  const [showUsers, setShowUsers] = useState('invisible');

  const buttonStyle = `
    flex flex-row gap-1 bg-deep-purple-300 w-10 h-6 
    rounded-md place-items-center justify-center border 
    border-deep-purple-100 hover:bg-deep-purple-400`

  async function reactionOnClick(){
    addOrRemoveReaction(props.emoji, push.api!.account.toLowerCase()!, props.cid)

    const reaction = await push.api!.chat.send(currentTextChannel.chatId, {
      type: 'Reaction',
      content: props.emoji,
      reference: props.cid,
    });
  }

  const usersList = props.users.map((user: string, index: number) => {
    // const userProfiles = useServerStore.getState().userProfiles
    if(props.userProfiles[user.toLowerCase()] == undefined){
      if(props.users.length == index+1){
        return <p key={user}>{user.substring(0,20)}</p>
      }else{
        return <p key={user}>{user.substring(0,20)},&nbsp;</p>
      }
    }else{
      if(props.users.length == index+1){
        // return <p key={user}>{user.substring(0,20)}</p>
        return <p key={user}>{props.userProfiles[user.toLowerCase()].name}</p>
      }else{
        // return <p key={user}>{user.substring(0,20)},&nbsp;</p>
        return <p key={user}>{props.userProfiles[user.toLowerCase()].name},&nbsp;</p>
      }
    }
  })

  // console.log("REACTION ELEMENT: emoji: " + props.emoji + " , count: " + props.count + " , cid: " + props.cid)

  return(
    <>
      <div className="relative">
        <button className={buttonStyle} onClick={() => reactionOnClick()} onMouseEnter={() => setShowUsers('visible')} onMouseLeave={() => setShowUsers('invisible')}>
          <div>
            {props.emoji}
          </div>
          <div>
            {props.count}
          </div>
        </button>
        <div className={"absolute top-7 bg-deep-purple-300 rounded-md max-h-20 border-deep-purple-100 border p-0.5 z-50 " + showUsers}>
          {/* {JSON.stringify(props.reaction.users)} */}
          <div className="flex">
            {usersList}
          </div>
        </div>
      </div>
    </>
  )
}