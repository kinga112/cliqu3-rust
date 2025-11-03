import { push } from "../../../push";
import { useDirectMessageStore } from "../../../state-management/dmStore";
import { useGlobalStore } from "../../../state-management/globalStore";
import { useServerStore } from "../../../state-management/serverStore";

export function EmojiElement(props: {emoji: string, cid: string, from: string, reactions: {[emoji: string]: {count: number, users: string[]}}}){
  const currentTextChannel = useServerStore(server => server.currentTextChannel)
  const currentScreen = useGlobalStore(globals => globals.currentScreen)
  const currentDM = useDirectMessageStore(dm => dm.currentDM)
  const addOrRemoveReaction = useServerStore(server => server.addOrRemoveReaction)

  async function sendReaction(){
    console.log("REACTIONS: " + JSON.stringify(props.reactions) + ", EMOJI: " + props.emoji + " FROM: " + props.from + " Cid: " + props.cid)
    addOrRemoveReaction(props.emoji, push.api!.account.toLowerCase()!, props.cid)

    let chatId = currentTextChannel.chatId
    if(currentScreen == 'DirectMessages'){
      chatId = currentDM!
      console.log("CHAT ID IN DM THING CURRENT SCREEN:", chatId)
    }
    

    const reaction = await push.api!.chat.send(chatId, {
      content: props.emoji,
      type: 'Reaction',
      reference: props.cid,
    });

    console.log("reaction respionse:", reaction)
  }

  return(
    <>
      <button className="hover:bg-deep-purple-400 rounded-md" onClick={sendReaction}>
        {props.emoji}
      </button>
    </>
  )
}