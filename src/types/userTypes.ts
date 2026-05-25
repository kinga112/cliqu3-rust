// import { UserProfile } from "@pushprotocol/restapi";
// import { PushAPI, UserProfile } from "@pushprotocol/restapi/src";

export interface User {
  address: string;
  audio: boolean;
  video: boolean;
  silence: boolean;
  authorized: boolean;
  profile: MemberProfile | null;
  // pushApi: PushAPI | null,
  serverList: string[];
}

export interface MemberProfile {
  address: string;
  name: string;
  avatar: string;
  description: string;
}

// export interface GunUser {
//   profile: String, // wallet address
//   serverList: string // GunServer ids
// }
