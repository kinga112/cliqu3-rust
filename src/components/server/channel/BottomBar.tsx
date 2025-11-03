import { useEffect, useRef, useState } from "react";
import { Reply } from "./Reply";
import close from "../../../assets/icons/close.svg"
import sticker from "../../../assets/icons/sticker.svg"
import gif from "../../../assets/icons/gif.svg"
import emoji2 from "../../../assets/icons/emoji2.svg"
import { useServerStore } from "../../../state-management/serverStore";
import { useDirectMessageStore } from "../../../state-management/dmStore";
import { useUserStore } from "../../../state-management/userStore";
import { useGlobalStore } from "../../../state-management/globalStore";
import { push } from "../../../push";
import { Message } from "../../../types/messageTypes";
import { v4 as uuidv4 } from 'uuid';
import { CHAT, UserProfile } from "@pushprotocol/restapi";
import GIFs from "./GIFs";

export function BottomBar(){
  const [input, setInput] = useState('');
  // const push = useHookstate(_push);
  // const [image, setImage] = useState('')
  const [images, setImages] = useState<Array<string>>([])
  const [showGiphy, setShowGiphy] = useState('invisible')
  const [showStickers, setShowStickers] = useState('invisible')
  const [showEmojis, setShowEmojis] = useState('invisible')
  const currentTextChannel = useServerStore((state) => state.currentTextChannel)
  const currentDM = useDirectMessageStore(dm => dm.currentDM)
  const currentScreen = useGlobalStore(global => global.currentScreen)
  const profile = useUserStore((user) => user.profile)
  const setUserProfiles = useServerStore(server => server.setUserProfiles)
  const setReply = useServerStore((server) => server.setReply)
  const setFiles = useServerStore((server) => server.setFiles)
  const appendFile = useServerStore((server) => server.appendFile)
  const files = useServerStore((server) => server.files)
  const appendMessage = useServerStore((state) => state.appendMessage)
  const addReferenceId = useServerStore((server) => server.addReferenceId)
  const setCurrentDM = useDirectMessageStore(dm => dm.setCurrentDM)
  const setNewMessage = useDirectMessageStore(dm => dm.setNewMessage)
  // const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const wrapperRef = useRef(null);
  const giphyRef = useRef(null);
  const stickerRef = useRef(null);
  const emojiRef = useRef(null);
  
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // console.log("EVENT: " + event.target.value);
    setInput(event.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';  // Reset the height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;  // Set it to the scroll height
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      send();
    }
  }

  // function adjustHeight() {
  //   inputRef.current?.style.height = 'auto'; 
  //   // textarea.style.height = 'auto';  // Reset the height
  //   // textarea.style.height = `${textarea.scrollHeight}px`;  // Set height based on scroll height
  // }
  
  outsideGiphyAlerter(giphyRef);
  outsideStickersAlerter(stickerRef);
  outsideEmojisAlerter(emojiRef)

  function outsideGiphyAlerter(ref: React.MutableRefObject<any>) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: MouseEvent) {
        if(ref.current){
          if (!ref.current.contains(event.target)) {
            setShowGiphy('invisible')
          }
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  function outsideStickersAlerter(ref: React.MutableRefObject<any>) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if(ref.current){
          if (!ref.current.contains(event.target)) {
            // alert("You clicked outside of me!");
            setShowStickers('invisible')
            // setShowInteractions('group-hover:visible invisible')
            // console.log("You clicked inside of me!");
          }
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  function outsideEmojisAlerter(ref: React.MutableRefObject<any>) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: MouseEvent) {
        if(ref.current){
          if (!ref.current.contains(event.target)) {
            setShowEmojis('invisible')
          }
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  async function send(){
    const files = useServerStore.getState().files;
    const reply = useServerStore.getState().reply;

    let from = push.api!.account.split(':')[1]
    if(from == undefined){
      from = push.api!.account
    }


    let chatId = currentTextChannel.chatId
    if(currentScreen == "DirectMessages"){
      chatId = currentDM!
    }

    const randomId = uuidv4();

    if(input.trim() == ''){
      if(files.length != 0){
          // var i: number = 0
          // for(i; i<files.length;i++){
        files.map(async (file: any) => {
          // console.log("FILE " + i + ": " + " type:" + files[i].type + ", name: " + files[i].name, ", base64: " + files[i].base64.substring(0,20))
          // console.log("FILE: type:" + file.type + ", name: " + file.name, ", base64: " + file.base64.substring(0,20))
          // const msg: Msg = {
          //   "id": randomId, "origin": "self", "timestamp": Date.now(),
          //   "chatId": currentTextChannel.chatId, "from": from.toLowerCase(),
          //   "message": { "type": "File", "content": `{"content":"data:${file.type};base64,${file.base64}, "name":${file.name}}`}, "meta": { "group": true }, "messageContent": message,
          //   "cid": "",
          //   reactions: [{
          //     emoji: '', count: 0,
          //     users: []
          //   }],
          //   reply: null
          // }
          // appendMessage(msg)

          // console.log("FILE: type:" + file.type + ", name: " + file.name, ", base64: " + file.base64.substring(0,20))
          const message: Message = {
            id: randomId, 
            origin: "self", 
            timestamp: Date.now(),
            chatId: chatId, 
            from: from.toLowerCase(),
            // message: { type: "File", content: `{"content":"data:${file.type};base64,${file.base64}, "name":${file.name}}`}, 
            message: {
              type: "File",
              content: `{"content":"${file.content}", "name":${file.name}}`
            },
            group: true,
            cid: "",
            reactions: {},
            reply: null
          }
          appendMessage(message)

          const fileReponse = await push.api!.chat.send(chatId, {
            type: 'File',
            // content: `{"content":"data:${file.type};base64,${file.base64}", "name":${file.name}}`,
            
            // old one works below but need to update for better code to convert content into json obj
            // content: `{"content":"data:${file.type};base64,${file.base64}, "name":${file.name}}`,
            // testing new below
            content: `{"content":"${file.content}", "name":${file.name}}`,
          });
          console.log("FILE RESPONSE: ", fileReponse)
        })
        setFiles([])
      }
    }else{
      if(reply){
        console.log("SENDING A REPLY::: of this message: " + reply.message)

        const message: Message = {
          id: randomId,
          chatId: chatId,
          origin: "self",
          timestamp: Date.now(),
          from: push.api!.account.toLowerCase()!,
          // type: 'Text',
          message: { type: 'Reply', content: { type: "Text", content: input }, reference: reply.reference },
          group: false,
          cid: "",
          // readCount: 0,
          // lastAccessed: 0,
          reply: { from: reply.from, message: reply.message, reference: reply.reference },
          reactions: {}
        }


        // appendMessage(msg)
        appendMessage(message)
        // cache.appendMessage(currentTextChannel.chatId, message)
        // setMessages
        setInput('')
        setReply(null)
        if(textareaRef.current != null){
          textareaRef.current.focus()
          textareaRef.current.style.height = 'auto';  // Reset height to auto
        }

        const replyResponse = await push.api!.chat.send(chatId, {
          type: 'Reply',
          content: {
            type: 'Text', content: input
          },
          reference: reply.reference
        })

        addReferenceId(randomId, replyResponse.cid)
        // cache.addCid(currentTextChannel.chatId, randomId, replyResponse.cid)
      }else{
        // console.log("SENDING FROM SELF::: ")
        console.log("SENDING A normal msgggg: " + input)
        const randomId = uuidv4();
        // const msg: Msg = {
        //   "id": randomId, "origin": "self", "timestamp": Date.now(),
        //   "chatId": currentTextChannel.chatId, "from": from.toLowerCase(),
        //   "message": { "type": "Text", "content": message }, "meta": { "group": true }, "messageContent": message,
        //   "cid": "",
        //   reactions: [{
        //     emoji: '', count: 0,
        //     users: []
        //   }],
        //   reply: null
        // }

        const message: Message = {
          chatId: chatId,
          id: randomId,
          origin: "self",
          timestamp: Date.now(),
          from: push.api!.account.toLowerCase()!,
          // type: 'Text',
          message: { type: 'Text', content: input },
          group: false,
          cid: "",
          // readCount: 0,
          // lastAccessed: 0,
          reply: null,
          reactions: {}
        }


        // appendMessage(msg)
        // console.log("APPENDING MESSAGE: " +JSON.stringify(message))
        // console.log("messages: " + JSON.stringify(useServerStore.getState().messages))
        appendMessage(message)
        // cache.appendMessage(currentTextChannel.chatId, message)
        setInput('')
        if(textareaRef.current != null){
          textareaRef.current.focus()
          textareaRef.current.style.height = 'auto';  // Reset height to auto
        }

        // const cid = await push.sendMessage(input, currentTextChannel.chatId);
        if(currentScreen == 'DirectMessages'){
          console.log("CHAT ID IN DM THING CURRENT SCREEN:", chatId)
          // if currentDM is an address from creating new DM, set userProfiles here
          // since chatId has not been set between users
          try{
            let profiles: { [address: string]: UserProfile } = {}
            profiles[push.api!.account.toLowerCase()!] = profile!
            const recipientProfile = await push.api!.profile.info({overrideAccount: chatId})
            profiles[chatId] = recipientProfile
            setUserProfiles(profiles)
          }catch{
            console.log("no address as chatId")
          }
        }

        // send message to chatId or currentDM address as chatId for 1 to 1 dms
        const msg = await push.api!.chat.send(chatId, {
          content: input,
          type: 'Text',
        });

        // set currentDM to new chatId and setNewMessage false so normal DM component renders
        if(currentScreen == 'DirectMessages'){
          setCurrentDM(msg.chatId!)
          setNewMessage(false)
        }

        console.log("MESSAGE FROM SEND! ", msg)

        addReferenceId(randomId, msg.cid);
        // cache2.updateLastReadMessageCid(currentTextChannel.chatId, msg.cid);
        // cache.addCid(currentTextChannel.chatId, randomId, cid!)
      }
    }
  }

  function onPaste(event: any){
    // console.log("ON PASTE: " + item.itemType)
    var text = (event.originalEvent || event).clipboardData.getData(
      "text/html"
    );

    if(text.includes('<img src=')){
      const src = text.split(`<img src="`)[1].split(`"`)[0]
      setImages([...images, src])
    }
  }

  function ImageItem(props: {src: string}){
    function removeImage(src: string){
      let filteredArray = images.filter(image => image !== src)
      setImages(filteredArray)
    }

    return(
      <>
        <div className="inline-block relative p-2">
          <img className="rounded-lg object-contain w-full h-full" src={props.src}/>
          <button className="absolute top-2 right-2" onClick={() => removeImage(props.src)}>
            <img className="hover:bg-red-700 rounded-full" src={close} height={35} width={35}/>
          </button>
        </div>
      </>
    )
  }

  const imageList = images.map((src: string) => {return <ImageItem key={src} src={src}/>})

  // const { openFilePicker, filesContent, loading } = useFilePicker({
  //   accept: ['.txt', '.pdf'],
  //   readAs: "ArrayBuffer",
  //   validators: [
  //     new FileSizeValidator({ maxFileSize: 1 * 1024 * 1024 /* 1 MB */ }),
  //   ],
  //   onFilesSelected: ({ plainFiles, filesContent, errors }) => {
  //     // this callback is always called, even if there are errors
  //     console.log('onFilesSelected', plainFiles, filesContent, errors);
  //     // console.log('onFilesSelected: ', plainFiles)
  //     if(errors == undefined){
  //       console.log("NO ERROR FILES : ", filesContent)
  //       // setFiles([...files, ...plainFiles])
  //       let count = 0
  //       filesContent.map((item: any) => {
  //         console.log()
  //         // const base64String = btoa(String.fromCharCode(...new Uint8Array(filesContent[count].content)));
  //         // const base64String = btoa(String.fromCharCode(...new Uint8Array(filesContent[count].content)));
  //         // let u8s = new Uint8Array(filesContent[count].content)
  //         // const base64string = Base64.fromUint8Array(u8s);
  //         // var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(filesContent[count].content)));
  //         console.log("CONTENT: " + filesContent[count].content)
  //         console.log("CONTENT TYPE: " + typeof(filesContent[count].content))
  //         // console.log('BASE 64 STRING:::' + base64String)
  //         // filesContent[count]['base64'] = base64string
  //         filesContent[count]['content'] = filesContent[count].content
  //         filesContent[count]['type'] = plainFiles[count].type
  //         // appendFile(filesContent[count])
  //         count += 1
  //       })
  //       const currentFilesState = useServerStore.getState().files;
  //       setFiles([...currentFilesState, ...filesContent])
  //       // appendFile()
  //       // setFileUpload(plainFiles)
  //     }
  //   },
  // });

  function FileItem(props: {file: any, index: number}){
    // console.log("FILE: " + props.file + " INDEX: " + props.index)
    function removeFile(file: any){
      // console.log("FILE STUFF: " + file.content)
      console.log("FILE STUFF: " + file.base64)
      let filteredArray = files.filter(f => f !== file)
      setFiles(filteredArray)
    }

    return(
      <>
        <div className="inline-block relative group">
          <div className="py-1 px-2 bg-deep-purple-100 text-deep-purple-300 rounded">
            {props.file.name}
          </div>
          <button className="absolute -top-2 -right-3 invisible group-hover:visible z-50" onClick={() => removeFile(props.file)}>
            <img className="hover:bg-red-700 rounded-full" src={close} height={25} width={25}/>
          </button>
        </div>
      </>
    )
  }

  function addEmoji(emoji: string){
    setInput(input + emoji)
  }

  // const filesList = filesContent.map((file, index) => {return <FileItem file={file} index={index}/>})
  const filesList = files.map((file, index) => {return <FileItem key={file.file} file={file} index={index}/>})
  const emojiList = Object.values(CHAT.REACTION)
  let emojiElements = emojiList.map((emoji: string) => <button key={emoji} className="hover:bg-deep-purple-400 rounded-md" onClick={()=> addEmoji(emoji)}>{emoji}</button>)

  return(
    <>
      {/* {image != '' ? <div className="bg-deep-purple-400 rounded-t-md p-3"><span dangerouslySetInnerHTML={{ __html: image }}></span></div> : <p/>} */}
      {/* {image != '' ? <div className="bg-deep-purple-400 rounded-t-md p-3"><img src={image}/></div> : <p/>} */}
      {/* {filesList.length != 0 ? <div className="flex bg-deep-purple-300 rounded-t-md px-3 pt-2 pb-4 gap-1 mx-3 mb-1">{filesList}</div> : <p/>} */}
      {/* {filesList.length != 0 ? <div className="flex bg-deep-purple-300 rounded-md mx-3 -mt-3 px-3 pt-2 pb-4 max-h-[500px]">{filesList}</div> : <p/>}
      {images.length != 0 ? <div className="flex bg-deep-purple-300 rounded-md mx-3 -mt-3 px-3 pt-2 pb-4 max-h-[500px]">{imageList}</div> : <p/>} */}
      <div className="flex w-full justify-center shrink-0">
      {/* <div className="fixed bottom-2 w-full justify-center shrink-0"> */}
        <div className="relative h-[calc(58px)] w-full mx-3">
          {/* <input ref={inputRef} onKeyDown={e => e.key == 'Enter' ? onSend(): ''} className="z-0 w-full h-full bg-off-black-600 rounded-lg p-2 focus:outline-none pr-56" placeholder='send message' value={input} onChange={handleInputChange} autoFocus={true} onPaste={onPaste}/> */}
          <div className="absolute bottom-2 w-full">
            <Reply/>
            {filesList.length != 0 ? <div className="absolute z-50 -top-1 -translate-y-full p-2 bg-deep-purple-300 rounded-md max-h-[500px]">{filesList}</div> : <p/>}
            {images.length != 0 ? <div className="absolute z-50 -top-1 -translate-y-full bg-deep-purple-300 rounded-md p-2 max-h-[500px]">{imageList}</div> : <p/>}
            <textarea rows={1} ref={textareaRef} onKeyDown={handleKeyDown} className="z-0 w-full min-h-14 bg-off-black-600 rounded-lg px-2 py-4 focus:outline-none pr-56 resize-none" placeholder={`Send message to #${currentTextChannel.name}`} value={input} onChange={handleInputChange} autoFocus={true} onPaste={onPaste}/>
            <div className="absolute right-[calc(68px)] top-2 bg-deep-purple-300 px-2 py-1 h-10 rounded-md">
              <div className="flex place-items-center h-full w-full gap-1">
                <button onClick={()=> setShowStickers('visible')}>
                  <img src={sticker} height={30} width={30}/>
                </button>
                <button onClick={()=> setShowGiphy('visible')}>
                  <img src={gif} height={35} width={35}/>
                </button>
                <button onClick={()=> setShowEmojis('visible')}>
                  <img src={emoji2} height={30} width={30}/>
                </button>
                {/* <button onClick={()=> openFilePicker()}>
                  <img src={file} height={30} width={30}/>
                </button> */}
              </div>
            </div>
            <div ref={giphyRef} className={"z-50 absolute w-[500px] h-[500px] right-5 bottom-14 bg-deep-purple-100 rounded border-2 border-deep-purple-300 " + showGiphy}>
              <GIFs/>
            </div>
            {/* <div ref={stickerRef} className={"absolute right-0 -top-[502px] w-[500px] h-[500px] bg-deep-purple-300 rounded-t-xl " + showStickers}>
              <StickerGrid/>
            </div> */}
            <div ref={emojiRef} className={"z-50 absolute right-5 bottom-14 bg-deep-purple-100 rounded-lg border-2 border-deep-purple-300 " + showEmojis}>
              <div className="grid gap-1 grid-cols-8 place-items-center text-3xl p-0.5 h-96 overflow-y-auto overflow-x-hidden">
                {emojiElements}
              </div>
            </div>
            <button className="absolute right-2 top-2 bg-deep-purple-300 px-2 py-1 h-10 rounded-md hover:bg-deep-purple-200" onClick={send}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
