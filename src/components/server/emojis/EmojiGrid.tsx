import { CHAT } from "@pushprotocol/restapi"
import { EmojiElement } from "./EmojiElement"

export function EmojiGrid(props: {cid: string, from: string, reactions: {[emoji: string]: {count: number, users: string[]}}}){
  const emojiList = Object.values(CHAT.REACTION)
  let emojiElements = emojiList.map((emoji: string) => <EmojiElement key={emoji.concat(props.cid)} emoji={emoji} cid={props.cid} from={props.from} reactions={props.reactions}/>)

  return(
    <>
      <div className="inline-grid gap-1 grid-cols-8 place-items-center text-3xl p-0.5 h-96 max-w-full overflow-y-auto overflow-x-hidden">
        {emojiElements}
      </div>
    </>
  )
}
