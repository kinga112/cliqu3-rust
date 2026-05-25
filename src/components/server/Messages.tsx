import { useEffect, useRef } from "react";
// import { useShallow } from 'zustand/react/shallow';
import { useServerStore } from "../../state-management/serverStore";
import MessageElement from "./message/MessageElement";
// import { Message } from "../../types/messageTypes";
// import { newFetchHistory } from "../../helperFunctions/fetch";
// import { cache2 } from "../../dexie";
// import { useDirectMessageStore } from "../../state-management/dmStore";
// import { useGlobalStore } from "../../state-management/globalStore";
// import { TextChannel } from "../../types/serverTypes";
// import { Virtuoso } from 'react-virtuoso'
// import { startReplicationOnLeaderShip } from "rxdb/plugins/replication";
// import { Message } from "../../cache";

export function Messages() {
  const currentTextChannel = useServerStore(
    (state) => state.currentTextChannel,
  );
  // const messages = useServerStore((state) => state.messages)
  // const messages = useServerStore(
  //   useShallow((state) => ({
  //     messages: state.messages,
  //   }))
  // );
  // const currentTextChannel = useServerStore((state) => state.currentTextChannel)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // const [loadMore, setLoadMore] = useState(false);
  // const [read, setRead] = useState(false)

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (scrollRef.current) {
  //       const max = scrollRef.current.scrollHeight - scrollRef.current.clientHeight
  //       localStorage.setItem("scrollTop", Math.round(scrollRef.current.scrollTop).toString())
  //       localStorage.setItem("scrollMax", max.toString())

  //       if(scrollRef.current.scrollTop < 200){
  //         setLoadMore(true)
  //       }else{
  //         setLoadMore(false)
  //       }

  //       if(max - scrollRef.current.scrollTop < 10){
  //         setRead(true)
  //       }else{
  //         setRead(false)
  //       }

  //     }
  //   };

  //   if (scrollRef.current) {
  //     scrollRef.current.addEventListener('scroll', handleScroll);
  //   }

  //   return () => {
  //     if (scrollRef.current) {
  //       scrollRef.current.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, []);

  // const messageList = useMemo(() => messages.messages.map((message: Message, index: number) => {
  //   return <MessageElement key={message.cid} message={message} lastMessage={messages.messages[index-1]}/>
  // }), [messages]);

  // console.log("MESSAGE LIST: ", messages.messages);

  // useEffect(() => {
  //   // scrolls to bottom when new messages come in if user is scroll is bottom!
  //   if (scrollRef.current) {
  //     const scrollMax = localStorage.getItem("scrollMax")
  //     const scrollTop = localStorage.getItem("scrollTop")
  //     if((Number(scrollMax) - Number(scrollTop)) < 10){
  //       scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  //     }
  //     // console.log("ST: ", scrollRef.current.scrollTop)
  //   }
  // }, [messages]);

  // 2. Scroll Logic: Use ref-based values instead of localStorage for speed
  useEffect(() => {
    if (scrollRef.current) {
      // const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // If user is near bottom (within 50px), auto-scroll
      // console.log("SCROLL H: ", scrollHeight, " SCROLL T: ", scrollTop, " CLIENT H: ", clientHeight)
      // if (scrollHeight - scrollTop < 50) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      // }
    }
  }, [currentTextChannel.messages]);

  // console.log("MESSAGE LIST: ", currentTextChannel.messages);

  const messageList = currentTextChannel.messages.map((message, index) => (
    <MessageElement
      key={message.id}
      message={message}
      lastMessage={currentTextChannel.messages[index - 1]}
    />
  ));

  // useEffect(() => {
  //   if(loadMore == true){
  //     fetchOld()
  //   }else{
  //     console.log("FALSE")
  //   }

  // }, [loadMore]);

  // useEffect(() => {
  //   if(read == true){
  //     const tempTextChannels: TextChannel[] = []
  //     textChannels.map((textChannel: TextChannel) => {
  //       let tempTextChannel: TextChannel = textChannel
  //       if(textChannel.chatId == currentTextChannel.chatId){
  //         tempTextChannel = { name: textChannel.name, chatId: textChannel.chatId, unread: false }
  //       }
  //       tempTextChannels.push(tempTextChannel)
  //     })
  //     setTextChannels(tempTextChannels)
  //   }else{
  //     console.log("FALSE")
  //   }

  // }, [read]);

  // async function fetchOld(){
  //   console.log("fetching Older Messages 1")
  //   const oldMessages = await cache2.fetchOlderMessages(currentTextChannel.chatId, messages[0].timestamp)
  //   appendOldMessages(oldMessages)
  // }

  // let marginRight = 'mr-8'
  // if(hasScrollbar){
  //   marginRight = ''
  // }

  // let marginTop = ''
  // if(messageList.length < 5){
  //   marginTop = 'mt-36'
  // }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex flex-col h-full justify-end overflow-y-auto"
      >
        {/* mb-2 to prevent scroll on not overflow ... idk tbh */}
        <div className="w-full flex flex-col min-h-0 mb-2 pb-6 pt-4">
          {messageList}
          {/* <Virtuoso
            style={{ height: '100%' }}
            overscan={200}
            className="w-full"
            initialTopMostItemIndex={messages.length - 1}
            followOutput="auto"
            alignToBottom={true}
            data={messages}
            itemContent={(index, message) => (
              <MessageElement message={message} lastMessage={messages[index-1]} />
            )}
          /> */}
        </div>
      </div>
      <div className="h-3 shrink-0" />
    </>
  );
}
