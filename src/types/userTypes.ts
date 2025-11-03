// import { UserProfile } from "@pushprotocol/restapi";
import { PushAPI, UserProfile } from "@pushprotocol/restapi/src";

export interface User {
  address: string,
  audio: boolean,
  video: boolean,
  silence: boolean,
  authorized: boolean,
  profile: UserProfile | null
  pushApi: PushAPI | null,
  serverList: string[],
}

export interface GunUser {
  profile: String, // wallet address
  serverList: string // GunServer ids
}