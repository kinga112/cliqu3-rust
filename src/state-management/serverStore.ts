// import { useProfile } from '@lens-protocol/api-bindings'
import { ChatMemberProfile, CONSTANTS, InfoOptions, TYPES, UserProfile, VideoPeerInfo } from '@pushprotocol/restapi/src'
import { VideoV2 } from '@pushprotocol/restapi/src/lib/video/VideoV2'
import { create } from 'zustand'
// import { Message, Reaction } from '../cache'
import { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream'
import { Message, Reply } from '../types/messageTypes'
import { ServerMetadata, ServerType, TextChannel, VoiceChannel } from '../types/serverTypes'
import { User } from '../types/userTypes'

type Action = {
  setMetadata: (metadata: ServerMetadata) => void,
  setUserProfiles: (userProfiles: { [address: string] : UserProfile }) => void
  setUsers: (users: { admins: Array<ChatMemberProfile>, members: Array<ChatMemberProfile> }) => void
//   setCurrentVoiceChannel: (name: Server['currentVoiceChannel']) => void
  setReply: (reply: Reply | null) => void
  setFiles: (files: Array<any>) => void
  appendFile: (file: any) => void
  setCurrentTextChannel:(currentTextChannel: TextChannel) => void
  setTextChannels:(textChannels: TextChannel[]) => void
  appendTextChannel: (textChannel: TextChannel) => void
  setVoiceChannels:(voiceChannels: {[chatId: string] : VoiceChannel}) => void
  setAddChannelModalVisibility: (visibility: boolean) => void,
  appendVoiceChannel: (voiceChannel: VoiceChannel) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void
  appendMessage: (message: Message) => void
  appendNewMessages: (messages: Message[]) => void
  appendOldMessages: (messages: Message[]) => void
  addReferenceId: (id: string, cid: string) => void
  addOrRemoveReaction: (emoji: string, user: string, cid: string) => void
}

// Create your store, which includes both state and (optionally) actions
export const useServerStore = create<ServerType & Action>((set) => ({
  metadata: { id: "", ticket: "", name: "", pic: "", creator_address: ""},
  // currentTextChannel: {name: '', chatId: '', unread: false},
  currentTextChannel: {name: '', chatId: ''},
  textChannels: [],
  voiceChannels: {},
  messages: [],
  reply: null,
  files: [],
  currentVoiceChannel: '',
  users: {admins: [], members: []},
  userProfiles: {},
  addChannelModalVisibility: false,
  setMetadata: (metadata: ServerMetadata) => set(() => ({metadata: metadata})),
  setUserProfiles: (userProfiles: { [address: string] : UserProfile }) => set(() => ({userProfiles: userProfiles})),
  setUsers: (users: {admins: Array<ChatMemberProfile>, members: Array<ChatMemberProfile>}) => set(() => ({users: users})),
  setCurrentVoiceChannel: (chatId: string) => set(() => ({currentVoiceChannel: chatId})),
  setReply: (reply: Reply | null) => set(() => ({reply: reply})),
  setCurrentTextChannel: (textChannel: TextChannel) => set(() => ({currentTextChannel: textChannel})),
  setTextChannels: (textChannels: TextChannel[]) => set(() => ({textChannels: textChannels})),
  appendTextChannel: (textChannel: TextChannel) => set((server: ServerType) => ({textChannels: [...server.textChannels, textChannel]})),
  setVoiceChannels: (voiceChannels: {[chatId: string] : VoiceChannel}) => set(() => ({voiceChannels: voiceChannels})),
  appendVoiceChannel: (voiceChannel: VoiceChannel) => set((server: ServerType) => {
    console.log("APPENDING VOICE CHANNEL: ", server.voiceChannels)
    server.voiceChannels[voiceChannel.name] = voiceChannel
    return { voiceChannels: server.voiceChannels }
  }),
  setAddChannelModalVisibility: (visibility: boolean) => set(() => ({addChannelModalVisibility: visibility})),
  clearMessages: () => set(() => ({messages: []})),
  setFiles: (files: Array<any>) => set(() => ({files: files})),
  appendFile: (file: any) => set((server: ServerType) => ({files: [...server.files, file]})),
  setMessages: (messages: Message[]) => set(() => ({messages: messages})),
  appendMessage: (message: Message) => set((server: ServerType) => ({messages: [...server.messages, message]})),
  appendNewMessages: (messages: Message[]) => set((server: ServerType) => ({messages: [...server.messages, ...messages]})),
  appendOldMessages: (messages: Message[]) => set((server: ServerType) => ({messages: [...messages, ...server.messages]})),
  addReferenceId: (id: string, cid: string) => set((server: ServerType) => ({
    messages: server.messages.map((msg: Message) =>
      msg.id === id ? { ...msg, cid: cid } : msg
    )
  })),
  addOrRemoveReaction: (emoji: string, user: string, cid: string) => set((server: ServerType) => {
    console.log("Updating reactions for message:", cid, "with emoji:", emoji, "by user:", user);
    const updatedMessages = server.messages.map((msg: Message) => {
      if (msg.cid !== cid) return msg; // Skip messages that don’t match
  
      // Ensure reactions object exists
      const reactions = msg.reactions || {};
  
      const existingReaction = reactions[emoji];
      const updatedReactions = { ...reactions };
  
      if (existingReaction) {
        if (existingReaction.users.includes(user)) {
          // Remove the user from reaction
          const updatedUsers = existingReaction.users.filter((u: string) => u !== user);
  
          if (updatedUsers.length > 0) {
            updatedReactions[emoji] = { count: updatedUsers.length, users: updatedUsers };
          } else {
            // No users left, delete the emoji key
            delete updatedReactions[emoji];
          }
        } else {
          // Add user to reaction
          updatedReactions[emoji] = {
            count: existingReaction.count + 1,
            users: [...existingReaction.users, user],
          };
        }
      } else {
        // Create a new reaction entry
        updatedReactions[emoji] = { count: 1, users: [user] };
      }
  
      return {
        ...msg,
        reactions: updatedReactions, // Ensure state changes with a new object reference
      };
    });
  
    return { messages: updatedMessages };
  }),  
  
}))