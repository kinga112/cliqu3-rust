// import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";
import { create } from "zustand"
import { ServerType, VoiceChannel } from "../types/serverTypes";

interface Globals {
  // currentDM: string
  // currentScreen: 'Server' | 'DirectMessages' | 'Settings',
  currentScreen: ServerType | null,
  currentVoiceChannel: string,
  settingsContent: string,
  showCreateServerModal: boolean,
  // stream: PushStream | undefined,
}

interface GlobalAction {
  // setCurrentDM: (id: string) => void,
  // setCurrentScreen: (screen:  'Server' | 'DirectMessages' | 'Settings') => void,
  setCurrentScreen: (screen: ServerType) => void,
  setCurrentVoiceChannel: (id: string) => void,
  setSettingsContent: (content: string) => void,
  setShowCreateServerModal: (bool: boolean) => void,
  // setStream: (stream: PushStream | undefined) => void,
}

export const useGlobalStore = create<Globals & GlobalAction>((set) => ({
  // currentDM: '',
  // currentScreen: 'DirectMessages',
  currentScreen: null,
  settingsContent: 'Update Profile',
  showCreateServerModal: false,
  currentVoiceChannel: '',
  // stream: undefined,
  // setCurrentDM: (id: string) => set({ currentDM: id }),
  // setCurrentScreen: (screen: 'Server' | 'DirectMessages' | 'Settings') => set({ currentScreen: screen }),
  setCurrentScreen: (screen: ServerType) => set({ currentScreen: screen }),
  setCurrentVoiceChannel: (id: string) => set({ currentVoiceChannel: id }),
  setSettingsContent: (content: string) => set({ settingsContent: content }),
  setShowCreateServerModal: (bool: boolean) => set({showCreateServerModal: bool})
  // setStream: (stream: PushStream | undefined) => set(() => ({stream: stream})),
}));
