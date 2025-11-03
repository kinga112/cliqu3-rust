import { create } from 'zustand';
import { User } from '../types/userTypes'
import { PushAPI, UserProfile } from "@pushprotocol/restapi/src";

type UserAction = {
  setAddress: (address: string) => void,
  setAudio: (audio: boolean) => void,
  setVideo: (video: boolean) => void,
  setSilence: (silence: boolean) => void,
  setAuth: (initiator: User['authorized']) => void,
  setProfile: (profile: UserProfile) => void,
  setServerList: (serverList: string[]) => void,
}

export const useUserStore = create<User & UserAction>((set) => ({
  address: '',
  audio: true,
  video: false,
  silence: false,
  authorized: false,
  profile: null,
  pushApi: null,
  serverList: [],
  setAddress: (address: string) => set(() => ({address: address})),
  setAudio: (audio: boolean) => set(() => ({audio: audio})),
  setVideo: (video: boolean) => set(() => ({video: video})),
  setSilence: (silence: boolean) => set(() => ({silence: silence})),
  setAuth: (authorized: boolean) => set(() => ({authorized: authorized})),
  setProfile: (profile: UserProfile) => set(() => ({profile: profile})),
  setPushApi: (pushApi: PushAPI) => set(() => ({pushApi: pushApi})),
  setServerList: (serverList: string[]) => set(() => ({serverList: serverList})),
}))
