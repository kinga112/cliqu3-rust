import { useEffect, useMemo, useRef, useState } from "react";
import { useServerStore } from "../../state-management/serverStore";
import MessageElement from "./message/MessageElement";
import { Message } from "../../types/messageTypes";
// import { newFetchHistory } from "../../helperFunctions/fetch";
// import { cache2 } from "../../dexie";
import { useDirectMessageStore } from "../../state-management/dmStore";
import { useGlobalStore } from "../../state-management/globalStore";
import { TextChannel } from "../../types/serverTypes";
// import { startReplicationOnLeaderShip } from "rxdb/plugins/replication";
// import { Message } from "../../cache";

export function Messages(){
  const messages = useServerStore((state) => state.messages)
  const currentTextChannel = useServerStore((state) => state.currentTextChannel)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [loadMore, setLoadMore] = useState(false);
  const [read, setRead] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const max = scrollRef.current.scrollHeight - scrollRef.current.clientHeight
        localStorage.setItem("scrollTop", Math.round(scrollRef.current.scrollTop).toString())
        localStorage.setItem("scrollMax", max.toString())
        
        if(scrollRef.current.scrollTop < 200){
          setLoadMore(true)
        }else{
          setLoadMore(false)
        }

        if(max - scrollRef.current.scrollTop < 10){
          setRead(true)
        }else{
          setRead(false)
        }

      }
    };

    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // console.log("MESSAGES: ", messages)

  // const messageList = useMemo(() => 
  //   messages.map((message: Message, index: number) => {
  //     // console.log("MESSAGE INDEX: " + index)
  //     // console.log("LAST MESSAGE INDEX FROM: " + messages[index-1].from)
  //     // let lastMessageFrom = ''
  //     // if(index != 0){
  //     //   lastMessageFrom = messages[index-1].from
  //     // }
  //     // console.log("LAST MESSAGE INDEX: " + messages[index-1].message.content)
  //     sortMessages(messages)
  //     return <MessageElement key={message.cid + message.id} message={message} lastMessage={messages[index-1]}/>
  //   }), 
  //   [messages]
  // );

  // properly sort messages based on timestamp (without, sometimes messages become out of order)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        return a.cid?.localeCompare(b.cid || '') ?? 0;
      }
      return a.timestamp - b.timestamp;
    });
  }, [messages]);

  const messageList = useMemo(() =>
    sortedMessages.map((message: Message, index: number) => {
      return <MessageElement key={message.cid + message.id} message={message} lastMessage={sortedMessages[index-1]}/>
    }),
    [sortedMessages]
  );

  useEffect(() => {
    // scrolls to bottom when new messages come in if user is scroll is bottom!
    if (scrollRef.current) {
      const scrollMax = localStorage.getItem("scrollMax")
      const scrollTop = localStorage.getItem("scrollTop")
      if((Number(scrollMax) - Number(scrollTop)) < 10){
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
      // console.log("ST: ", scrollRef.current.scrollTop)
    }
  }, [messages]);


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

  return(
    <>
      <div ref={scrollRef} className="flex flex-col h-full justify-end overflow-y-auto">
        <div key={currentTextChannel.chatId} className="w-full flex flex-col min-h-0 mb-2 pb-6 pt-4"> {/* mb-2 to prevent scroll on not overflow ... idk tbh */}
          {messageList}
        </div>
      </div>
      <div className="h-3 shrink-0"/>
    </>
  )
}
