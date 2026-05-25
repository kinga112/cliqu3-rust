// functions for insert and get cache
import { invoke } from "@tauri-apps/api/core";
import { Message } from "./types/messageTypes";
import { tryCatch } from "./tryCatch";

export async function addMessagesToCache(chatId: string, messages: Message[]) {
  // console.log("adding fetched messages to cache: ", typeof(messages))
  // console.log("for chatId: ", typeof(chatId))
  const result = await tryCatch(
    invoke("add_messages_to_cache", { chatId, messages }),
  );
  if (!result.error) {
    // console.log("Added messages to cache: ", result.data)
  } else {
    console.log("Error ", result.error);
  }
}

export async function getMessagesFromCache(chatId: string): Promise<Message[]> {
  // const startTime = performance.now(); // High-resolution timestamp
  const result = await tryCatch(invoke("get_messages_from_cache", { chatId }));
  // console.log("Result from getMessagesFromCache: ", result);
  if (!result.error) {
    // console.log("MESSAGES FROM CACHE as BYTES: ", result.data);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(result.data as Uint8Array);
    const data = JSON.parse(jsonString);
    // const endTime = performance.now();
    // const duration = endTime - startTime;
    // console.log(`Get Cache Duration: ${duration.toFixed(3)}ms`);
    return data as Message[];
  } else {
    console.log("Error ", result.error);
    return [];
  }
}

export async function updateMessageInCache(
  chatId: string,
  messageCid: string,
  message: Message,
) {
  const result = await tryCatch(
    invoke("update_message_in_cache", { chatId, messageCid, message }),
  );
  if (!result.error) {
    // console.log("Updated message in cache: ", result.data)
  } else {
    // console.log("Error ", result.error)
  }
}

export async function updateReactionInCache(
  chatId: string,
  messageCid: string,
  reaction: string,
  user: string,
) {
  const result = await tryCatch(
    invoke("update_reaction_in_cache", { chatId, messageCid, reaction, user }),
  );
  if (!result.error) {
    // console.log("Updated message reaction in cache: ", result.data)
  } else {
    // console.log("Error ", result.error)
  }
}

export async function getLastReadCidInCache(chatId: string) {
  const result = await tryCatch(invoke("get_cid_from_cache", { chatId }));
  if (!result.error) {
    // console.log("Got last message cid in cache: ", result.data)
    return result.data as string;
  } else {
    // console.log("Error ", result.error)
  }
}

export async function addLastReadCidInCache(
  chatId: string,
  messageCid: string,
) {
  const result = await tryCatch(
    invoke("add_cid_to_cache", { chatId, messageCid }),
  );
  if (!result.error) {
    // console.log("Updated message reaction in cache: ", result.data)
  } else {
    // console.log("Error ", result.error)
  }
}
