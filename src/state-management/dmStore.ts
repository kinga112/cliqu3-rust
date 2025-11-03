import { IFeeds } from "@pushprotocol/restapi";
import { create } from "zustand"

type DirectMessageState = {
  currentDM: string | null,
  currentNavOption: 'CHATS' | 'REQUESTS',
  newMessage: boolean,
  chats: IFeeds[],
  requests: IFeeds[],
}

interface DirectMessageAction {
  setCurrentDM: (dm: string | null) => void,
  setCurrentNavOptions: (option: 'CHATS' | 'REQUESTS') => void,
  setNewMessage: (newMessage: boolean) => void,
  setChats: (chats: IFeeds[]) => void,
  setRequests: (requests: IFeeds[]) => void,
}

export const useDirectMessageStore = create<DirectMessageState & DirectMessageAction>((set) => ({
  currentDM: null,
  currentNavOption: 'CHATS',
  newMessage: true,
  chats: [],
  requests: [],
  setCurrentDM: (dm: string | null) => set({currentDM: dm}),
  setCurrentNavOptions: (option: 'CHATS' | 'REQUESTS') => set({currentNavOption: option }),
  setNewMessage: (newMessage: boolean) => set({newMessage: newMessage }),
  setChats: (chats: IFeeds[]) => set({chats: chats }),
  setRequests: (requests: IFeeds[]) => set({requests: requests }),
}));
