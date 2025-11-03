// Import Push SDK & Ethers
// import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { CONSTANTS, IUser, PushAPI, UserProfile } from '@pushprotocol/restapi/src';
import { useUserStore } from './state-management/userStore';
import { useServerStore } from "./state-management/serverStore"
// import { Message } from "../cache"
import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream"
import { v4 as uuidv4 } from 'uuid';
import { Content, Message, ReferenceContent, Reply } from "./types/messageTypes"
// import { cache2 } from "../dexie"
// import { TextChannel } from "../types/serverTypes";
import { useGlobalStore } from "./state-management/globalStore";
import { useDirectMessageStore } from "./state-management/dmStore";
import { tryCatch } from './tryCatch';
import { invoke } from '@tauri-apps/api/core';

export class Push {
  api: PushAPI | undefined;
  stream: PushStream | undefined;

  async initApi(api: PushAPI){
    this.api = api
    console.log("USER ACOUNT: " + this.api.account)
    this.stream = await this.initStream()
  }

  blockUser(address: string){
    this.api!.chat.block([address]).then((user: IUser) => {
      // console.log("BLOCKED USER: ", user)
      // console.log("PROFILE: ", user)
      const newBlockedUsersList = user.profile.blockedUsersList
      newBlockedUsersList!.push(address)
      const newProfile: UserProfile = {
        name: user.profile.name,
        desc: user.profile.desc,
        picture: user.profile.picture,
        profileVerificationProof: user.profile.profileVerificationProof,
        blockedUsersList: newBlockedUsersList
      }
      useUserStore.getState().setProfile(newProfile)
    })
  }

  unblockUser(address: string){
    this.api!.chat.unblock([address]).then((user: IUser) => {
      // console.log("Unblocked USER: ", user.profile)
      const newBlockedUsersList = user.profile.blockedUsersList!.filter(item => item !== address);
      const newProfile: UserProfile = {
        name: user.profile.name,
        desc: user.profile.desc,
        picture: user.profile.picture,
        profileVerificationProof: user.profile.profileVerificationProof,
        blockedUsersList: newBlockedUsersList
      }
      useUserStore.getState().setProfile(newProfile)
    })
  }

//   async initSavedUser(signer: ether.providers.JsonRpcSigner, decryptedPGPKey: string, address: string){
//     this.api = await PushAPI.initialize(signer, {
//       decryptedPGPPrivateKey: decryptedPGPKey,
//       env: CONSTANTS.ENV.STAGING, // or your app's environment
//       account: address,
//     });
//     console.log("SAVED USER: ", this.api.account)
//   }

//   async initUser(signer: ethers.Wallet | ethers.JsonRpcProvider, decryptedPGPKey?: string){
//     let s: SignerType;
//     if(decryptedPGPKey){
//       // console.log("GOT PGP KEY: ", decryptedPGPKey)
//       this.api = await PushAPI.initialize(signer, {
//         decryptedPGPPrivateKey: decryptedPGPKey,
//         // env: appConfig.appEnv,
//         env: CONSTANTS.ENV.STAGING,
//         account: localStorage.getItem('account'),
//         // progressHook: onboardingProgressReformatter,
//         // alpha: { feature: ['SCALABILITY_V2'] },
//       });
//       console.log("USER...: ", this.api)
//     }else{
//       this.api = await PushAPI.initialize(signer, {
//         env: CONSTANTS.ENV.STAGING,
//       });
//       console.log("KEY: ", this.api.decryptedPgpPvtKey!)
//       localStorage.setItem('saved-user', this.api.decryptedPgpPvtKey!)
//       localStorage.setItem('address', this.api.account)
//     }
//   }

  async createTextChannel(serverId: string, name: string, description: string, userAddresses: Array<string>){
    console.log("CREATING NEW CHAT CHANNEL", this.api!.account)
    const newChannel = await this.api!.chat.group.create(
      name, {
        description: description,
        // image: '',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAvklEQVR4AcXBsW2FMBiF0Y8r3GQb6jeBxRauYRpo4yGQkMd4A7kg7Z/GUfSKe8703fKDkTATZsJsrr0RlZSJ9r4RLayMvLmJjnQS1d6IhJkwE2bT13U/DBzp5BN73xgRZsJMmM1HOolqb/yWiWpvjJSUiRZWopIykTATZsJs5g+1N6KSMiO1N/5DmAkzYTa9Lh6MhJkwE2ZzSZlo7xvRwson3txERzqJhJkwE2bT6+JhoKTMJ2pvjAgzYSbMfgDlXixqjH6gRgAAAABJRU5ErkJggg==',
        // members: userAddresses,
        // members: undefined,
        // admins: [],
        // admins: undefined,
        private: false,
        rules: {
          entry: { conditions: [] },
          chat: { conditions: [] },
        },
      },
    );
    console.log("new chat channel id:", newChannel.chatId)
    const result = await tryCatch(invoke("add_text_channel", { id: serverId, name, textChannelId: newChannel.chatId }));
    if(result.error){
      console.log("creating new text channel failed")
    }

    return newChannel.chatId
  };

  async sendMessage(message: string, chatId: string){
    console.log('Sending message from: ' + this.api!.account);
  
    const msg = await this.api!.chat.send(chatId, {
      content: message,
      type: 'Text',
      // type: 'Reply',
    });

    console.log("Send message response: ", msg)
    
    return msg.cid
  }

  async sendImage(url: string, chatId: string){
    const appendMessage = useServerStore.getState().appendMessage
    const setReply = useServerStore.getState().setReply
    const address = useUserStore.getState().address
    console.log("address on send image:", address)
    let msg: any = { type: "MediaEmbed", content: url }
    let r = null
    const reply = useServerStore.getState().reply;
    if(reply){
      msg = { type: "Reply", content: msg, reference: reply.reference }
      r =  { from: reply.from, message: reply.message, reference: reply.reference }
    }
    const randomId = uuidv4();
    const message: Message = {
      id: randomId,
      chatId: chatId,
      origin: "self",
      timestamp: Date.now(),
      from: address.toLowerCase(),
      message: msg,
      group: true,
      cid: "",
      reply: reply,
      reactions: {}
    }
    appendMessage(message)
    setReply(null)

    const response = await this.api!.chat.send(chatId, msg);
  }

  async fetchChats(){
    const chats = await this.api!.chat.list('CHATS');
    console.log("CHATS: " + chats)
  }




  ////////////////

  async initStream(): Promise<PushStream | undefined> {
    try {
      console.log("INITIALIZING STREAM")
      const stream = await this.api!.initStream(
        [
          CONSTANTS.STREAM.CHAT, // Listen for chat messages
          CONSTANTS.STREAM.SPACE,
          CONSTANTS.STREAM.SPACE_OPS,
          CONSTANTS.STREAM.CONNECT, // Listen for connection events
          CONSTANTS.STREAM.DISCONNECT, // Listen for disconnection events
          CONSTANTS.STREAM.VIDEO // CALLS
        ],
        {
          // Filter options:
          filter: {
            channels: ['*'],
            chats: ['*'],
          },
          connection: {
            retries: 3, // Retry connection 3 times if it fails
          },
          raw: false, // Receive events in structured format
        }
      );

      stream!.on(CONSTANTS.STREAM.CONNECT, () => {
        console.log('Stream Connected: ' + this.api!.account);
      });
      
      stream!.on(CONSTANTS.STREAM.CHAT, async (pushMsg: any) => {
        const appendMessage = useServerStore.getState().appendMessage;
        const addOrRemoveReaction = useServerStore.getState().addOrRemoveReaction;
        const currentScreen = useGlobalStore.getState().currentScreen;
        const currentDM = useDirectMessageStore.getState().currentDM;
        const currentTextChannel = useServerStore.getState().currentTextChannel;
        const textChannel = useServerStore.getState().textChannels;
        const setTextChannels = useServerStore.getState().setTextChannels;
        console.log("STREAM GOT NEW MESSAGE!!! ", stream?.uid)

        const randomId = uuidv4();
        let from = pushMsg.from.split(':')[1].toLowerCase();

        console.log("from: 1 " + from)
        if(from == undefined){
          from = pushMsg.from.toLowerCase();
        }
        console.log("from: 2 " + from)

        if(pushMsg.message.type == 'Reaction'){
          if(pushMsg.origin != 'self' && !pushMsg.from.includes(this.api!.account.toLowerCase())){
            addOrRemoveReaction(pushMsg.message.content, from, pushMsg.message.reference)
          }
          console.log("ADD OR REMOVE REACTION: ", pushMsg.message)
          // update message in cache with reaction
          // cache2.updateReactions(pushMsg.message.content, from, pushMsg.message.reference)
        }else{
          console.log("NOT REACTION")
          let content: Content | ReferenceContent = pushMsg.message
          let reply: Reply | null = null
          if(pushMsg.message.type == 'Reply'){
            console.log("GOT A REPLY!", pushMsg.message)
            const foundMessage = await this.api!.chat.history(pushMsg.chatId, {reference: pushMsg.message.reference, limit: 1})
            console.log("FIND ELEMENT IN REPLY: ", foundMessage)
            content = {
              type: pushMsg.message.type,
              content: {
                type: pushMsg.message.content.messageType,
                content: pushMsg.message.content.messageObj.content
              },
              reference: pushMsg.message.reference
            }

            const from: string = foundMessage[0]!.fromDID.replace('eip155:', '')
            console.log("REPLY FROM: ", from)

            let replyContent = foundMessage[0]!.messageObj.content
            if(typeof replyContent !== "string"){
              replyContent = foundMessage[0]!.messageObj.content.messageObj.content
            }

            console.log("message content: ", replyContent)

            reply = {
              from: from.toLowerCase(),
              message: replyContent,
              reference: pushMsg.message.reference 
            }
          }else{
            console.log("THIS MESSAGE IS NOT REACTION OR REPLY")
          }

          const message: Message = {
            id: randomId,
            chatId: pushMsg.chatId,
            origin: pushMsg.origin,
            timestamp: Number(pushMsg.timestamp),
            from: from,
            message: content,
            group: pushMsg.meta.group,
            cid: pushMsg.reference,
            reply: reply,
            reactions: {}
          }
          
          // Append to state if user is not the sender and user is in received message channel
          let chatId = currentTextChannel.chatId
          if(currentScreen == 'DirectMessages'){
            chatId = currentDM!
          }
          if(pushMsg.origin != 'self' && !pushMsg.from.includes(this.api!.account.toLowerCase()) && chatId == pushMsg.chatId){
            console.log("APPENDING MESSAGE")
            appendMessage(message)
          }

          // Use add message to cache if not Reaction, seperate function for reaction
          console.log("BEFORE MESSAGE ADD")
          // cache2.addMessage(message)
          console.log("AFTER MESSAGE ADD")
          // let tempTextChannels: TextChannel[] = []
          console.log("MESSAGE ID: ", message.chatId)
          console.log("CURRENT: ", chatId)
          if(message.chatId != chatId){
            console.log("Starting FOR EACH!!")
            // textChannel.map((textChannel: TextChannel) => {
            //   if(textChannel.chatId == message.chatId){
            //     console.log("NEW NOTIFICATION!!!!")
            //     tempTextChannels.push({ name: textChannel.name, chatId: textChannel.chatId, unread: true})
            //   }else{
            //     tempTextChannels.push(textChannel)
            //   }
            // })
            console.log("Setting Chat Channels!!!!")
            // setTextChannels(tempTextChannels)
          }
        }
        // Update the lastReadMessageCid to sync for fetch
        // CHECK THIS FOR MIDDLE MESSAGE ERRORS, if user doesnt open channel and fetch 
        // from history will middle messages get lost if stream updates last read message cid? Yes... big issue :(((
        // cache2.updateLastReadMessageCid(pushMsg.chatId, pushMsg.reference);
      });
      return stream
    } catch (error) {
      console.error('Error on Stream Init:', error);
      return undefined
    }
  }

  async getHistory(chatId: string, reference: string | null = null): Promise<[boolean, string | null, string | null]>{
    console.log("Fetching Messages! New Fetch History")
    const appendNewMessages = useServerStore.getState().appendNewMessages;
    const addOrRemoveReaction = useServerStore.getState().addOrRemoveReaction;
    // const channel = await cache2.fetchChannel(chatId)
    const history = await this.api!.chat.history(chatId, {reference: reference, limit: 30})
    
    let fetchedMessages: Message[] = []
    let lastReadCid: string | null = null

    console.log("REF FOR FETCH: ", reference)
    if(reference == null){
      try{
        lastReadCid = history[0].cid
        // if(channel.lastReadMessageCid == lastReadCid){
        //   console.log("first message is last read CID")
        //   return [false, null, null]
        // }
        console.log("setting last read cid in fetch: " + lastReadCid)
      }catch{
        console.log("new channel so no messages yet... so no history.. duhh")
        return [false, null, null]
      }
    }
    
    let cid = ''
    var i = 0
    for(i; i<history.length;i++){
      const pushMsg = history[i]
      console.log("PushMsg:", pushMsg)
      const randomId = uuidv4();
      const from: string = pushMsg.fromDID.split(':')[1].toLowerCase()

      console.log(i)
      // console.log(pushMsg)

      if(i == (history.length - 1)){
        cid = pushMsg.cid
      }
      
      // console.log("LAST MESSAGE READ: ", channel.lastReadMessageCid)
      
      // if(channel.lastReadMessageCid == pushMsg.cid){
      //   console.log("This message CID is last Read mesasge CID: ", pushMsg)
      //   console.log("FETCHED MESSAGES with false in reverse ", fetchedMessages.reverse())
      //   appendNewMessages(fetchedMessages)
      //   // console.log("BEFORE RETURN IF")
      //   return [false, null, lastReadCid]
      // }else{
      //   console.log("update last read message cid after while loop of fetch finishes.")
      // }

      if(pushMsg.messageType == 'Reaction'){
        console.log("THIS IS A REACTION FETCHED FROM PUSH")
        console.log("reaction message: ", pushMsg)
        addOrRemoveReaction(pushMsg.messageContent, from, pushMsg.messageObj.reference)
        // cache2.updateReactions(pushMsg.messageContent, from, pushMsg.messageObj.reference)
      }else{
        // let content: Content | ReferenceContent = { type: pushMsg.messageType, content: pushMsg.messageContent }
        let content: Content | ReferenceContent = { type: pushMsg.messageType, content: pushMsg.messageObj.content }
        let reply: Reply | null = null
        if(pushMsg.messageType == 'Reply'){
          console.log("THIS IS A REPLY FETCHED FROM PUSH")
          const foundMessage: any = await this.api!.chat.history(chatId, {reference: pushMsg.messageObj.reference, limit: 1})
          console.log("reply message: ", pushMsg)

          content = {
            type: pushMsg.messageType,
            content: {
              type: pushMsg.messageObj.content.messageType,
              content: pushMsg.messageObj.content.messageObj.content
            },
            reference: pushMsg.messageObj.reference
          }

          const replyFrom = foundMessage[0]!.fromDID.split(':')[1].toLowerCase()
          let replyContent = foundMessage[0]!.messageObj.content
          if(typeof replyContent !== "string"){
            replyContent = foundMessage[0]!.messageObj.content.messageObj.content
          }

          console.log("message content: ", pushMsg)

          reply = {
            from: replyFrom,
            message: replyContent,
            reference: pushMsg.messageObj.reference
          }


          // reply = {
          //   from: findElement[0]!.from,
          //   message: findElement[0]!.messageObj.content, 
          //   reference: pushMsg.messageObj.reference 
          // }

        }else{
          console.log("FETCHED MESSAGE NOT REPLY OR REACTION")
          console.log("reaction message: ", pushMsg)
        }
        const message: Message = {
          id: randomId,
          chatId: chatId,
          origin: pushMsg.origin,
          timestamp: pushMsg.timestamp,
          from: from,
          message: content,
          // group: pushMsg.meta.group,
          group: true,
          cid: pushMsg.cid,
          reply: reply,
          reactions: {}
        }
        // cache2.addMessage(message)
        fetchedMessages.push(message)
      }
    }

    console.log("reference before return: " + cid)
    console.log("FETCHED MESSAGES with true: ", fetchedMessages)
    appendNewMessages(fetchedMessages)
    console.log("BEFORE RETURN ELSE")
    return [true, cid, lastReadCid]
  }

  async getNewMessages(chatId: string){
    let count = 0
    let reference: string | null = null
    let success = false
    let lastRef: string = ''
    let cid: string | null = null
    let lastReadCid: string = ''
    // const c = await cache2.fetchChannel(chatId);
    // console.log("CHANNEL before fetching push messages: ", c)
    while(true){
      console.log("NEW FETCH HISTORY: chatid: " + chatId + ", reference: " + reference);
      console.log("LAST READ CID: before fetch: ", lastReadCid);
      [success, reference, cid] = await this.getHistory(chatId, reference);
      console.log("AFTER FETCH HISTORY: RESSULTS: success: " + success + ", reference: ", reference + ", cid: " + cid);
      if(cid != null){
        console.log("last read cid is not null: ", cid);
        lastReadCid = cid;
      }
      if(!success){
        // new channel and no messages sent yet
        if(lastReadCid != ''){
          console.log("Setting last read cid 1: ", lastReadCid);
          // cache2.updateLastReadMessageCid(chatId, lastReadCid);
        }
        break
      }
      if(lastRef == reference){
        console.log("CANT LOAD ANY MORE MESSAGES: " + count);
        if(lastReadCid != ''){
          console.log("Setting last read cid 2: ", lastReadCid);
          // cache2.updateLastReadMessageCid(chatId, lastReadCid);
        }
        break
      }else{
        if(reference != null){
          lastRef = reference
        }
      }
      if(count > 20){
        // cache2.updateLastReadMessageCid(chatId, lastReadCid)
        break
      }else{
        count += 1
      }
    }
  }


}

export const push = new Push;
