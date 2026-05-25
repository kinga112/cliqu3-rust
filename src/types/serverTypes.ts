// import { ChatMemberProfile, UserProfile } from "@pushprotocol/restapi";
import { XMTPMessage } from "./messageTypes";
import { MemberProfile } from "./userTypes";
// import { Message, Reply } from "./messageTypes"
//

export type ServerType = {
  metadata: ServerMetadata;
  currentTextChannel: TextChannel;
  textChannels: TextChannelMetaData[];
  voiceChannels: { [id: string]: VoiceChannel };
  // reply: Reply | null;
  files: Array<any>;
  currentVoiceChannel: string;
  addChannelModalVisibility: boolean;
};

export type IrohServerType = {
  creator_hash: string;
  metadata: ServerMetadata;
  text_channels: { name: string; chat_id: string };
  voice_channels: { [id: string]: VoiceChannel };
};

// export type ServerType = {
//   metadata: ServerMetadata;
//   currentTextChannel: TextChannel;
//   textChannels: TextChannel[];
//   voiceChannels: { [id: string]: VoiceChannel };
//   messages: Message[];
//   reply: Reply | null;
//   files: Array<any>;
//   currentVoiceChannel: string;
//   users: {
//     admins: Array<ChatMemberProfile>;
//     members: Array<ChatMemberProfile>;
//   };
//   userProfiles: { [address: string]: UserProfile }; // easier to search for user: structure: {'address': <Profile>}
//   addChannelModalVisibility: boolean;
// };

export type ServerMetadata = {
  id: string;
  ticket: string;
  name: string;
  pic: string;
  creator_address: string;
};

export type VoiceChannel = {
  name: string;
  active_users: string[];
};

export type TextChannel = {
  id: string;
  name: string;
  description: string;
  messages: XMTPMessage[];
  members: { [inboxId: string]: MemberProfile };
};

export type TextChannelMetaData = {
  name: string;
  id: string;
};

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
