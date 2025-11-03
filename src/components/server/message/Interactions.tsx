import reply from '../../../assets/icons/reply.svg'
import emoji from '../../../assets/icons/emoji2.svg'
import { useServerStore } from "../../../state-management/serverStore"
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Message } from '../../../types/messageTypes'
import { EmojiGrid } from '../emojis/EmojiGrid'
// import { Message } from '../../../cache'

function Interactions(props: {message: Message}){
  const setReply = useServerStore((server) => server.setReply);
  const [showEmojis, setShowEmojis] = useState('invisible');
  const [showInteractions, setShowInteractions] = useState('group-hover:visible invisible');
  const emojiRef = useRef(null);
  useOutsideAlerter(emojiRef);

  function useOutsideAlerter(ref: React.MutableRefObject<any>) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (!ref.current.contains(event.target)) {
          setShowEmojis('invisible')
          setShowInteractions('group-hover:visible invisible')
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const toggleEmojis = useCallback(() => {
    setShowEmojis((prev) => (prev === 'invisible' ? 'visible' : 'invisible'));
  }, []);

  const toggleInteractions = useCallback(() => {
    setShowInteractions((prev) =>
      prev === 'group-hover:visible invisible' ? 'visible' : 'group-hover:visible invisible'
    );
  }, []);

  function emojiClick(){
    // console.log("Timestamp: ", props.message.timestamp)
    console.log("Message: ", props.message)
    // console.log("Reactions: ", props.message.reactions)
    if(showEmojis == 'invisible'){
      toggleEmojis()
      toggleInteractions()
    }else{
      toggleEmojis()
    }
  }

  let replyMessage = ''

  if(typeof props.message.message.content == 'string'){
    replyMessage = props.message.message.content.substring(0, 75)
  }else{
    replyMessage = props.message.message.content.content.substring(0, 75)
  }

  return(
    <div className={"absolute right-5 -bottom-5 w-20 h-10 bg-deep-purple-300 rounded-lg z-10 " + showInteractions }>
      <div className="flex h-10 p-1.5 relative gap-2 place-items-center justify-center">
        <button className="text-deep-purple-100 border-2 border-deep-purple-100 rounded-lg" 
                onClick={()=> setReply({from: props.message.from, message: replyMessage, reference: props.message.cid})}>
          <img className="select-none" src={reply} height={25} width={25}/>
        </button>
        <button className="text-deep-purple-300" onClick={()=> emojiClick()}>
          <img className="select-none" src={emoji} height={30} width={30}/>
        </button>
        <div ref={emojiRef} className={"z-50 absolute right-0 bottom-10 bg-deep-purple-100 rounded-lg w-fit min-w-max " + showEmojis}>
          <EmojiGrid cid={props.message.cid} from={props.message.from} reactions={props.message.reactions}/>
        </div>
      </div>
    </div>
  )
}

export default memo(Interactions)