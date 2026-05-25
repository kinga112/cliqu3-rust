use moka::sync::Cache;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

// #[derive(Clone, Serialize, Deserialize, Debug)]
// pub struct Message {
//     id: String,
//     chat_id: String,
//     timestamp: i64,
//     from: String,
//     message: Content,
//     group: String,
//     cid: String,
//     reply: Option<Reply>,
//     reactions: HashMap<String, Reaction>
// }

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")] // <--- THIS IS THE MAGIC LINE
pub struct Message {
    pub id: String,
    pub chat_id: String,     // Will look for "chatId" in TS
    pub timestamp: i64,
    pub from: String,
    pub message: Content,
    pub group: bool,
    pub cid: String,
    pub reply: Option<Reply>,
    pub reactions: HashMap<String, Reaction>
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(untagged)] // Serde will try to match the structure of the data
pub enum Content {
    NormalContent(NormalContent),
    ReferenceContent(ReferenceContent),
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NormalContent {
    #[serde(rename = "type")] // Maps TS "type" -> Rust "content_type"
    pub content_type: String, 
    pub content: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ReferenceContent {
    #[serde(rename = "type")]
    pub content_type: String,
    pub content: NormalContent, // Matches TS: content: Content
    pub reference: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Reply {
    from: String,
    message: String,
    reference: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Reaction {
    count: i32,
    users: Vec<String>,
}

pub struct Moka {
    // pub cache: Cache<String, Vec<Message>>,
    pub message_cache: Cache<String, Arc<Vec<Message>>>,
    pub channel_cache: Cache<String, String>,
}

impl Moka {
    pub fn default() -> Self {
        // 25 text channels with max 1000 messages
        // ~50mb of ram if each channel holds 1000 messages

        // Cache<(ChatId, PageNumber), Arc<Vec<Message>>>
        let message_cache = Cache::builder()
            .max_capacity(10_000)
            .build();

        let channel_cache = Cache::builder()
            .max_capacity(1_000)
            .build();

        Self { message_cache, channel_cache }
    }

    pub fn insert_messages(&self, chat_id: String, messages: Vec<Message>) {
        // println!("Inserting messages {:?} into cache for chat_id: {:?}", messages, chat_id);
        let cached_messages = self.message_cache.get(&chat_id);
        if let Some(existing_messages) = cached_messages {
            let mut combined_messages = (*existing_messages).clone();
            combined_messages.extend(messages);
            self.message_cache.insert(chat_id, Arc::new(combined_messages));
            return;
        }
        self.message_cache.insert(chat_id, Arc::new(messages));
    }

    pub fn get_messages(&self, chat_id: &str) -> Result<Vec<Message>, String> {
        let cached_messages = self.message_cache.get(chat_id);
        match cached_messages {
            Some(messages) => {
                // println!("Messages found in cache: {:?}", messages);
                let mut messages = (*messages).clone();
                // Sort the messages by timestamp (Ascending: Oldest first)
                // Use .sort_unstable_by_key for better performance on primitive i64
                messages.sort_unstable_by_key(|m| m.timestamp);
                return Ok(messages);
            }
            None => {
                println!("No messages found in cache for chat_id: {}", chat_id);
                return Ok(vec![]);
            }
        }
    }

    pub fn update_message(&self, chat_id: &str, message_cid: &str, message: Message) -> Result<(), String> {
        if let Some(messages_arc) = self.message_cache.get(chat_id) {
            // Create a mutable clone of the vector
            let mut messages = (*messages_arc).clone();
            // Find and update the specific message
            if let Some(msg) = messages.iter_mut().find(|m| m.cid == message_cid) {
                // Update the message
                *msg = message;
                // insert the updated list back into the cache
                self.message_cache.insert(chat_id.to_string(), Arc::new(messages));
                return Ok(());
            }
            return Err("Message ID not found in cache".to_string());
        }
        Err("Chat ID not found in cache".to_string())
    }

    pub fn update_reaction(&self, chat_id: &str, message_cid: &str, reaction: &str, user: &str) -> Result<(), String> {
        // println!("Updating reaction: {} by user: {} for message_cid: {} in chat_id: {}", reaction, user, message_cid, chat_id);
        let cached_messages = self.message_cache.get(chat_id);
        match cached_messages {
            Some(messages) => {
                // println!("Messages found in cache: {:?}", messages);
                let mut messages = (*messages).clone();
                if let Some(msg) = messages.iter_mut().find(|m| m.cid == message_cid) {
                    // Update the message
                    // println!("Found message {:?} to update reaction", msg);
                    // let mut message = msg.clone();
                    let reactions = &mut msg.reactions;
                    if let Some(reaction_entry) = reactions.get_mut(reaction) {
                        if reaction_entry.users.contains(&user.to_string()) {
                            // println!("User {} already reacted with {}, removing reaction", user, reaction);
                            // User already reacted, remove their reaction
                            reaction_entry.users.retain(|u| u != user);
                            reaction_entry.count -= 1;
                        } else {
                            // println!("User {} adding reaction {}", user, reaction);
                            // User hasn't reacted yet, add their reaction
                            reaction_entry.users.push(user.to_string());
                            reaction_entry.count += 1;
                        }
                    } else {
                        // Reaction doesn't exist yet, create it
                        // println!("Creating new reaction {} by user {}", reaction, user);
                        reactions.insert(reaction.to_string(), Reaction {
                            count: 1,
                            users: vec![user.to_string()],
                        });
                    }
                    // insert the updated list back into the cache
                    // println!("Inserting updated messages back into cache: {:?}", messages);
                    self.message_cache.insert(chat_id.to_string(), Arc::new(messages));
                }
                return Ok(());
            }
            None => {
                println!("No messages found in cache in update reaction for chat_id: {}", chat_id);
                return Ok(());
            }
        }
    }

    pub fn get_last_read_message_cid(&self, chat_id: &str) -> Result<String, String> {
        let cached_channel = self.channel_cache.get(chat_id);
        match cached_channel {
            Some(last_read_cid) => {
                println!("Last read CID found in cache: {}", last_read_cid);
                return Ok(last_read_cid);
            }
            None => {
                println!("No channel found in cache for chat_id: {}", chat_id);
                return Ok("".to_string());
            }
        }
    }

    pub fn insert_last_read_message_cid(&self, chat_id: String, message_cid: String) {
        println!("Inserting last read message cid {:?} into cache for chat_id: {:?}", message_cid, chat_id);
        self.channel_cache.insert(chat_id, message_cid);
    }

}
