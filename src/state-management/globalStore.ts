// import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";
import { create } from "zustand"
import { ServerType } from "../types/serverTypes";
import { PushAPI } from "@pushprotocol/restapi";
import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";

interface Globals {
  // currentDM: string
  // currentScreen: 'Server' | 'DirectMessages' | 'Settings',
  // authorized: boolean,
  // currentScreen: ServerType | null,
  showSavedUsers: boolean,
  currentServer: ServerType | null
  currentScreen:  'Server' | 'DirectMessages' | 'Settings',
  currentVoiceChannel: string,
  pushApi: PushAPI | null,
  settingsContent: string,
  showCreateServerModal: boolean,
  stream: PushStream | undefined,
  savedAddresses: string[],
  currentGifNav: "Recents" | "Trending" | "Categories" | "Search",
  klipyPage: number,
  klipy: 'gifs' | 'stickers',
  // stream: PushStream | undefined,
}

interface GlobalAction {
  // setCurrentDM: (id: string) => void,
  // setCurrentScreen: (screen:  'Server' | 'DirectMessages' | 'Settings') => void,
  setCurrentServer: (currentScreen: ServerType | null) => void,
  setCurrentScreen: (currentScreen: 'Server' | 'DirectMessages' | 'Settings') => void,
  setCurrentVoiceChannel: (id: string) => void,
  setPushApi: (pushApi: PushAPI) => void,
  setSettingsContent: (content: string) => void,
  setShowCreateServerModal: (bool: boolean) => void,
  setShowSavedUsers: (bool: boolean) => void,
  setStream: (stream: PushStream | undefined) => void,
  setSavedAddresses: (addresses: string[]) => void,
  setCurrentGifNav: (gifNav: "Recents" | "Trending" | "Categories" | "Search") => void,
  setKlipy: (klipy: 'gifs' | 'stickers') => void,
  setKlipyPage: (gifPage: number) => void,
  // setStream: (stream: PushStream | undefined) => void,
}

export const useGlobalStore = create<Globals & GlobalAction>((set) => ({
  // authorized: false,
  currentServer: null,
  currentScreen: 'DirectMessages',
  settingsContent: 'Update Profile',
  showCreateServerModal: false,
  currentVoiceChannel: '',
  pushApi: null,
  stream: undefined,
  showSavedUsers: false,
  savedAddresses: [],
  currentGifNav: "Recents",
  klipyPage: 1,
  klipy: 'gifs',
  setPushApi: (pushApi: PushAPI) => set(() => ({pushApi: pushApi})),
  // setAuthorized: (auth: boolean) => set({ authorized: auth }),
  setCurrentServer: (server: ServerType | null) => set({ currentServer: server }),
  setCurrentScreen: (screen: 'Server' | 'DirectMessages' | 'Settings') => set({ currentScreen: screen }),
  setCurrentVoiceChannel: (id: string) => set({ currentVoiceChannel: id }),
  setSettingsContent: (content: string) => set({ settingsContent: content }),
  setShowCreateServerModal: (bool: boolean) => set({showCreateServerModal: bool}),
  setShowSavedUsers: (bool: boolean) => set({showSavedUsers: bool}),
  setStream: (stream: PushStream | undefined) => set(() => ({stream: stream})),
  setSavedAddresses: (addresses: string[]) => set({savedAddresses: addresses}),
  setCurrentGifNav: (gifNav: "Recents" | "Trending" | "Categories" | "Search") => set({currentGifNav: gifNav}),
  setKlipy: (klipy: 'gifs' | 'stickers') => set({klipy: klipy}),
  setKlipyPage: (page: number) => set({klipyPage: page}),
  // setStream: (stream: PushStream | undefined) => set(() => ({stream: stream})),
}));
