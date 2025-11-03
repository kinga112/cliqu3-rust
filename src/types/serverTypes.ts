import { ChatMemberProfile, UserProfile } from "@pushprotocol/restapi"
import { Message, Reply } from "./messageTypes"

export type IrohServerType = {
  creator_hash: string
  metadata: ServerMetadata
  text_channels: { name: string, chat_id: string }
  voice_channels: { [id: string] : VoiceChannel }
}

export type ServerType = {
  metadata: ServerMetadata
  currentTextChannel: TextChannel,
  // currentTextChannel: {
  //   name: string
  //   chatId: string
  //   unread: boolean
  // }
  textChannels: TextChannel[]
  voiceChannels: { [id: string] : VoiceChannel }
  messages: Message[]
  reply: Reply | null
  files: Array<any>
  currentVoiceChannel: string
  users: { admins: Array<ChatMemberProfile>, members: Array<ChatMemberProfile> }
  userProfiles: { [address: string] : UserProfile } // easier to search for user: structure: {'address': <Profile>}
  addChannelModalVisibility: boolean
}

export type ServerMetadata = {
  id: string
  ticket: string
  name: string
  pic: string
  creator_address: string
}

export type VoiceChannel = {
  name: string
  active_users: string[]
}

export type TextChannel = {
  name: string
  chatId: string
}


// export interface VoiceChannel {
//   name: string
//   chatId: string
//   // peerInfo: string
//   peerInfo: VideoPeerInfo | null
// }

// export interface TextChannel {
//   name: string
//   chatId: string
//   unread: boolean
// }
