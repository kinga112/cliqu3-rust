use moka::sync::Cache;
use std::collections::HashMap;

#[derive(Clone)]
pub struct Message {
    id: String,
    chat_id: String,
    timestamp: i64,
    from: String,
    message: Content,
    group: String,
    cid: String,
    reply: Option<Reply>,
    reactions: HashMap<String, Reaction>
}

#[derive(Clone)]
enum Content {
    NormalContent(NormalContent),
    ReferenceContent(ReferenceContent),
}

#[derive(Clone)]
struct NormalContent {
    content_type: String,
    content: String,
}

#[derive(Clone)]
struct ReferenceContent {
    content_type: String,
    content: String,
    refernce: String,
}

#[derive(Clone)]
struct Reply {
    from: String,
    message: String,
    reference: String,
}

#[derive(Clone)]
struct Reaction {
    count: i32,
    users: Vec<String>,
}

pub struct Moka {
    pub cache: Cache<String, Vec<Message>>,
}

impl Moka {
    pub fn default() -> Self {
        // 25 text channels with max 1000 messages
        // ~50mb of ram if each channel holds 1000 messages
        let cache = Cache::builder()
            .max_capacity(25)
            .build();
        Self { cache }
    }

    pub fn insert_messages(&self, chat_id: String, messages: Vec<Message>) {
        self.cache.insert(chat_id, messages);
    }

    pub fn get_messages(&self, chat_id: &str) {
        self.cache.get(chat_id);
    }
}
