import { useRef, useState } from "react"
import { useServerStore } from "../../../state-management/serverStore"
import { BottomBar } from "./BottomBar"
import { Messages } from "../Messages"
import { MembersList } from "./MembersList"
import users from "../../../assets/icons/users.svg"

export function ChatChannel(){
  const currentTextChannel = useServerStore((state) => state.currentTextChannel)
  const [showUsers, setShowUsers] = useState(true)
  const setMessages = useServerStore((server) => server.setMessages)
  const appendMessage = useServerStore((server) => server.appendMessage)
  const elementRef = useRef<HTMLDivElement>(null)
  const [hasScrollbar, setHasScrollbar] = useState(false);
  // cache.channels!.$.subscribe((changeEvent: any) => {
  //   // const messages = useServerStore.getState().messages
  //   console.log("CHANGE EVENT : " + changeEvent['operation'] + ", DATA: " + JSON.stringify(changeEvent['documentData'].messages));
  //   // if(changeEvent['operation'] == 'UPDATE'){
  //   //   setMessages(changeEvent['documentData'].messages)
      
  //   //   // appendMessage(changeEvent['documentData'])
  //   //   // setMessages([
  //   //     // ...messages,
  //   //     // changeEvent['documentData']
  //   //   // ])
  //   //   // appendMessage(changeEvent['documentData'].messages)
  //   // }
  // });

  const checkScrollbar = () => {
    if (elementRef.current) {
      const { clientHeight, scrollHeight } = elementRef.current;
      setHasScrollbar(clientHeight < scrollHeight);
    }
  };

  // const ScrollableComponent = forwardRef((props, ref) => {
  //   return (
  //     <Messages ref={elementRef} />
  //     // <div
  //     //   ref={ref}
  //     //   className="h-40 overflow-y-auto border border-gray-400 p-2"
  //     //   style={{ width: '200px' }}
  //     // >
  //     //   {props.children}
  //     // </div>
  //   );
  // });

  return(
    <>
      <div className="flex flex-col h-full w-full bg-off-black-500">
        <div className="flex h-14 border-b z-10 border-off-black-700 shadow-md shadow-off-black-700 justify-between place-items-center px-3 shrink-0 text-4xl font-extralight">
          {currentTextChannel.name}
          {currentTextChannel.chatId != '' ? <div className="flex">
            <button onClick={() => setShowUsers(!showUsers)} className="flex justify-center place-items-center h-10 w-10 rounded-md bg-deep-purple-300">
              <img src={users} height={30} width={30}/>
            </button>
          </div> : <div/>
          } 
        </div>
        <div className="flex flex-col overflow-hidden h-full w-full">
          <Messages/>
          {/* {hasScrollbar ?  <div className="h-14"/> : <div/> } */}
          {/* <div className="h-14"/> Spacer to push scroll bar up */}
          {/* <Messages messages={currentMessages.value}/> */}
          {/* <Messages/> */}
          <BottomBar/>
        </div>
      </div>
      {currentTextChannel.chatId != '' && showUsers ? <MembersList key={currentTextChannel.chatId}/> : <div/>}
    </>
  )
}