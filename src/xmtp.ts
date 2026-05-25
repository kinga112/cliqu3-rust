// services/xmtp.ts

// import { Client, Signer } from "@xmtp/browser-sdk"; // adjust import if using different SDK build
import {
  Client,
  Signer,
  ConsentState,
  IdentifierKind,
} from "@xmtp/browser-sdk";
import type {
  Reaction,
  BuiltInContentTypes,
  Identifier,
} from "@xmtp/browser-sdk";
import { ethers } from "ethers";
import { tryCatch } from "./tryCatch";
import { invoke } from "@tauri-apps/api/core";

// type StreamHandler = (msg: any) => void;

class XmtpService {
  private client: Client | null = null;
  // private streamAbort?: AbortController;

  async initClient(
    jsonRpcSigner: ethers.providers.JsonRpcSigner,
    address: string,
  ) {
    if (this.client?.isReady) return this.client.isReady;
    console.log("XMTP INIT:", address);
    const signer: Signer = {
      type: "EOA",
      getIdentifier: () => ({
        identifier: address, // Ethereum address as the identifier
        identifierKind: IdentifierKind.Ethereum,
      }),
      signMessage: async (message: string) => {
        console.log("XMTP SIGN");
        const signature = await jsonRpcSigner.signMessage(message);
        return ethers.utils.arrayify(signature);
      },
    };
    console.log("AFTER SIGNER: ", signer);
    this.client = await Client.create(signer, {
      env: "dev",
    });
    return this.client.isReady;
  }

  getClient() {
    if (!this.client) throw new Error("XMTP not initialized");
    return this.client;
  }

  // Conversations
  async createConverstation(
    inboxIds: string[],
    name: string,
    description?: string,
    imageUrl?: string,
  ) {
    const client = this.getClient();
    const newGroup = await client.conversations.createGroup(inboxIds, {
      groupName: name,
      groupDescription: description,
      groupImageUrlSquare: imageUrl,
    });
    return newGroup;
  }

  async listConversations() {
    const client = this.getClient();
    const groups = await client.conversations.listGroups();
    return groups;
  }

  async getConversation(id: string) {
    const client = this.getClient();
    let identifier: Identifier = {};
    const inbox_id = client.fetchInboxIdByIdentifier(identifier);
    const convo = await client.conversations.getConversationById(id);
    return convo;
  }

  // Messages
  async sendMessage(id: string, content: string) {
    const convo = await this.getConversation(id);
    return await convo!.sendText(content);
  }

  async getMessages(id: string) {
    const convo = await this.getConversation(id);
    const messages = await convo!.messages();
    return messages;
  }

  // Stream
  async initStream() {
    const client = this.getClient();
    const stream = await client.conversations.streamAllMessages({
      consentStates: [ConsentState.Allowed],
      onValue: (message) => {
        if (
          typeof message.content === "object" &&
          "action" in message.content
        ) {
          console.log("Stream got a new reaction:", message.content);
        } else {
          console.log("Not reaction message:", message.content);
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
      },
    });
  }

  // Text Channel
  async createTextChannel(
    serverId: string,
    inboxIds: string[],
    name: string,
    description?: string,
    imageUrl?: string,
  ) {
    const newGroup = await this.createConverstation(
      inboxIds,
      name,
      description,
      imageUrl,
    );
    const result = await tryCatch(
      invoke("add_text_channel", {
        id: serverId,
        name,
        textChannelId: newGroup.id,
      }),
    );
    if (result.error) {
      console.log("creating new text channel failed");
    }
  }

  // DM

  /* ------------------ STREAM ------------------ */

  //   async streamMessages(handler: StreamHandler) {
  //     const client = this.getClient();

  //     this.stopStream(); // prevent duplicates
  //     this.streamAbort = new AbortController();

  //     for await (const msg of await client.conversations.streamAllMessages()) {
  //       handler(msg);
  //     }
  //   }

  //   stopStream() {
  //     this.streamAbort?.abort();
  //     this.streamAbort = undefined;
  //   }

  //   /* ------------------ RESET ------------------ */

  //   async disconnect() {
  //     this.stopStream();
  //     this.client = null;
  //     this.signer = null;
  //     this.initialized = false;
  //   }
}

export const xmtp = new XmtpService();
