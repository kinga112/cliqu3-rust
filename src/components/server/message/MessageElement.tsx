import { memo, useState } from "react";
// import { Message } from "../../../cache";
import { useServerStore } from "../../../state-management/serverStore";
import { Dialog, DialogPanel } from "@headlessui/react";
import carrot from '../../../assets/icons/carrot.svg'
import pdf from '../../../assets/icons/pdf.svg'
import Interactions from "./Interactions";
import LinkPreview from "./LinkPreview";
import DisplayName from "./DisplayName";
import { Message } from "../../../types/messageTypes";
import { Reaction } from "./Reaction";

// function MessageElement(props: {message: Message}){
function MessageElement(props: {message: Message, lastMessage: Message}){
  const userProfiles = useServerStore((server) => server.userProfiles)
  
  // console.log("MESSAGE stringify: " + JSON.stringify(props.message.reactions))
  if(props.message.message == undefined){
    return <div/>
  }
  // if(typeof props.message.message.content === 'string'){
  //   console.log("MESSAGE 1: " + props.message.message.content)
  // }else{
  //   console.log("MESSAGE 2: " + props.message.message.content.content)
  // }
  // SUBSCRIBE TO JUST THIS MESSAGE IN THE STORE
  // const message = useStore((state) => state.messages.find(msg => msg.cid === cid));
  
  if(props.message.from == undefined){
    return <div/>
  }

  function withinFiveMinutes(timestamp1: number, timestamp2: number): boolean {
    const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2); // Get absolute difference
    const fiveMinutesInMilliseconds = 5 * 60 * 1000; // 5 minutes in milliseconds
  
    return differenceInMilliseconds <= fiveMinutesInMilliseconds;
  };

  let shortFormat = false
  if(props.lastMessage != undefined){
    if(props.message.from == props.lastMessage.from && withinFiveMinutes(props.message.timestamp, props.lastMessage.timestamp)){
      shortFormat = true
    }
  }

  let picture: string | null = null
  // console.log("PROPS > MESSAGE:", props.message)
  // console.log("USER PROFILE: ", userProfiles)
  if(userProfiles[props.message.from] != undefined){
    // console.log("user: ", userProfiles[props.message.from])
    picture = userProfiles[props.message.from].picture!
  }
  
  let fileContent = false
  if(props.message.message.type == 'File'){
    fileContent = true
  }

  let imageContent = false;
  if(props.message.message.type == 'MediaEmbed'){
    imageContent = true
  }

  // let showReply = false
  let overflow = false
  let messageContent = ''

  if(typeof props.message.message.content === "string"){
    // console.log("String: ", props.message.message.content)
    messageContent = props.message.message.content
  }else{
    // console.log("PROPS.MESSAGE.MESSAGE.CONTENT: ", props.message.message.content)
    // console.log("ELSE: ", props.message.message.content)
      // console.log("FIRST MESSAGE THINF YEAH:::", props.message.message.content)
    messageContent = props.message.message.content.content
    if(!messageContent){
      messageContent = ' '
    }
    // messageContent = props.message.message.content.messageObj
    // console.log("CONTENT TYPE OF REPLY TYPE: " + message.message.content.type)
    if(props.message.message.content.type == 'MediaEmbed'){
      imageContent = true
    }
    // console.log("MESSAGE REPLY: ", props.message.message)
    if(props.message.reply!.message){
      if(props.message.reply!.message.length >= 50){
        overflow = true
      }
    }
  }

  // console.log("MESSAGE CONTENT::::: ", messageContent)

  let reactions = Object.entries(props.message.reactions).map(([emoji, reaction]) => {
    console.log("EMOJI: ", emoji)
    console.log("count: ", reaction.count)
    return reaction.count == 0 ? <p/> : <Reaction key={emoji+reaction.count} emoji={emoji} count={reaction.count} users={reaction.users} cid={props.message.cid} userProfiles={userProfiles}/>
  });

  function Linkify(props: {messageContent: string}){
    let found = false
    let before = ''
    let after = ''
    let link = ''
    let clickable = ''

    if(!messageContent){
      return
    }

    const isUrl = (word: string) => {
      const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
      return word.match(urlPattern)
    }

    const addMarkup = (word: string) => {
      if(isUrl(word)){
        link = word
        clickable = link
        if(clickable.substring(0,3) == 'www'){
            clickable = 'https://' + link
        }
        found = true
      }else{
        if(found){
            after = after.concat(" ", word)
        }else{
            before = before.concat(" ", word)
        }
      }
    }
    // console.log("MESSAGE HELLOOOOOOOOOO:", props.messageContent)
    const words = props.messageContent.split(' ')
    words.map((w, i) => addMarkup(w))

    // const contentString = `${props.messageContent}`

    if(found){
      return(
        <>
          <div className="flex flex-col gap-2 w-full">
            <span>
              <p className="inline">{before}&nbsp;</p>
              { found ? <a className="text-blue-400 hover:text-blue-500 inline" href={clickable} target="_blank">{link}</a> : <p/>}
              <p className="inline">&nbsp;{after}</p>
            </span>
            <LinkPreview url={link}/>
          </div>
        </>
      )
    }else{
      return (
        <>
          {/* <p>{props.messageContent}</p> */}
          <p className="whitespace-pre-line">{props.messageContent}</p>
        </>
      )
    }
  }

  function Content(){
    const [openFile, setOpenFile] = useState(false)

    function FileModal(props: {base64string: string}){
      return (
        <>
          {/* <button onClick={() => setIsOpen(true)}>Open dialog</button> */}
          <Dialog open={openFile} onClose={() => {setOpenFile(false)}} className="relative z-50 text-deep-purple-100 select-none">
            <div className="fixed inset-0 flex w-screen items-center justify-center">
              <DialogPanel>
                <iframe className="h-[750px] w-[750px]" src={'data:application/pdf;base64,' + props.base64string}/>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      )
    }

    // imageContent ? <img className="rounded-md" src={messageContent}/> : <Linkify messageContent={messageContent}
    if(imageContent == true){
      return <img className="rounded-md object-scale-down" src={messageContent}/>
    }else if(fileContent == true){
      // console.log(messageContent)
      // const f = JSON.parse(messageContent)
      // console.log(JSON.stringify(f))
      const base64string = messageContent.split('base64,')[1].split(',')[0]
      const name = messageContent.split('"name":')[1].split('}')[0]
      // console.log("BASE 64 STRING !!! : " + base64string)
      // console.log("Name: " + name)
      let icon = pdf
      return (
        <div>
          <FileModal base64string={base64string}/>
          <button className="flex gap-1 py-1 px-2 bg-deep-purple-300 border border-deep-purple-100 rounded-md place-items-center" onClick={() => setOpenFile(true)}>
            <img src={icon} height={30} width={30}/>
            {name}
          </button>
        </div>
      )
    }else{
      return <Linkify messageContent={messageContent}/>
    }
  }

  function MessageFormat(){
    if(shortFormat){
      const time = new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: '2-digit'}).format(props.message.timestamp)
        return(
          <>
            <div className="flex place-items-start gap-2 w-full h-full group">
              <div className="flex text-xxs font-semibold justify-center text-center w-14 shrink-0 p-1 invisible group-hover:visible select-none">{time}</div>
              <div className={"flex flex-col w-full " + (reactions.length == 0 ? "" : "gap-1")}>
                <div>
                  <Content/>
                </div>
                <div key={props.message.cid + props.message.id} className="flex gap-1">
                  {reactions}
                </div>
              </div>
            </div>
          </>
        )
    }else{
      const time = new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(props.message.timestamp)
      return(
        <>
          <div className="flex place-items-start gap-2 w-full h-full">
            <img src={picture!} className="w-14 h-14 bg-deep-purple-100 rounded-md shrink-0 object-cover select-none pointer-events-none"/>
            <div className={"flex flex-col w-full " + (reactions.length == 0 ? "" : "gap-1")}>
              <div className="flex flex-row place-items-center gap-2">
                <DisplayName address={props.message.from}/>
                <div className="text-xxs font-semibold select-none">
                  {time}
                </div>
              </div>
              <div>
                <Content/>
              </div>
              <div className="flex gap-1">
                {reactions}
              </div>
            </div>
          </div>
        </>
      )
    }
  }

  // if(props.message.reply?.from!){
    // console.log("props.message.reply:", props.message.reply)
    // console.log("props.message.reply.from:", props.message.reply.from)
  // }

  return(
    <>
      <div key={props.message.id + props.message.cid} className={"flex-col place-items-start relative p-1 hover:bg-off-black-300 gap-2 group rounded ml-8 " + (shortFormat ? "" : "mt-4")}>
        {props.message.reply ? <div className="flex justify-center gap-3 pl-4">
          <img className="select-none" src={carrot} height={20} width={30}/>
          {/* <p className="text-sm truncate max-w-full">{props.message.reply!.messageBlip}{ overflow ? '...' : ''}</p> */}
          <div className="flex bg-off-black-100 p-2 rounded-sm gap-2 place-items-center">
            {/* <p className="font-semibold">{props.message.reply!.from}</p> */}
            {props.message.reply!.from ? <DisplayName address={props.message.reply!.from!.toLowerCase()}/> : <p/> }
            <p className="text-sm truncate">{props.message.reply!.message}</p>
          </div>
        </div> : <div/>}
        <MessageFormat/>
        <Interactions key={props.message.id + props.message.cid} message={props.message}/>
      </div>
    </>
  )
}

export default memo(MessageElement)