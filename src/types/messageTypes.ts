export interface Message {
  id: string;
  chatId: string;
  origin: string;
  timestamp: number;
  from: string;
  message: Content | ReferenceContent;
  group: boolean;
  cid: string;
  reply: Reply | null;
  reactions: {
    [emoji: string]: {
      count: number;
      users: string[]
    };
  };
}

export interface Reply {
  from: string;
  message: string;
  reference: string;
}

export interface Content {
  type: string;
  content: string;
}

export interface ReferenceContent {
  type: string;
  content: Content;
  reference: string;
}
