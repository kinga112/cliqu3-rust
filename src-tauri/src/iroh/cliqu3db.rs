use std::collections::HashMap;
use std::{path, vec};
use std::str::FromStr;
use std::str;
use anyhow::{Result, anyhow};
use futures_lite::StreamExt;
use iroh_blobs::store::mem::MemStore;
use iroh_docs::api::protocol::{AddrInfoOptions, ShareMode};
use iroh_docs::engine::LiveEvent;
use iroh_docs::{protocol::Docs, store::Query, AuthorId, DocTicket, NamespaceId, ALPN as DOCS_ALPN};
use iroh::{protocol::Router, Endpoint};
use iroh_blobs::{BlobsProtocol, store::fs::FsStore, ALPN as BLOBS_ALPN};
use iroh_gossip::{net::Gossip, ALPN as GOSSIP_ALPN};
use iroh_roq::{ALPN as ROQ_ALPN};
use serde::{Serialize, Deserialize};
use tauri::Emitter;
use uuid::Uuid;
use sha2::Sha256;
use hmac::{Hmac, Mac};
// use base64::{engine::general_purpose, Engine};

type HmacSha256 = Hmac<Sha256>;

#[derive(Serialize, Deserialize)]
pub struct Server {
    // pub id: String,
    // pub name: String,
    pub creator_hash: String,
    pub metadata: ServerMetadata,
    // pub time_created: i64,
    // pub users: Vec<String>,
    pub text_channels: Vec<String>,
    // pub voice_channels: Vec<VoiceChannel>,
    pub voice_channels: HashMap<String, VoiceChannel>,
}

#[derive(Serialize, Deserialize)]
pub struct ServerMetadata {
    pub id: String,
    pub name: String,
    pub pic: String,
    // pub creator: String,
    pub creator_address: String,
    // pub creatorHash: 
}

#[derive(Serialize, Deserialize, Clone)]
pub struct VoiceChannel {
    name: String,
    active_users: Vec<String>,
}

pub struct Cliqu3Db {
    docs: Docs,
    // blobs: MemStore,
    blobs: FsStore,
    author: AuthorId,
    // server_docs: Vec<Doc>,
    // user_docs: vec!<Doc>,
}

impl Cliqu3Db {
    // Create a new ServersDb (a single document)
    pub async fn new(path: path::PathBuf) -> Result<Self> {
        let endpoint = Endpoint::builder().discovery_n0().bind().await?;

        let gossip = Gossip::builder().spawn(endpoint.clone());

        // let store = MemStore::new();

        // let blobs_path = path::PathBuf::from("C:/Users/kinga/Documents/cliqu3/iroh_blobs");
        // let docs_path = path::PathBuf::from("C:/Users/kinga/Documents/cliqu3/iroh_docs");
        // tokio::fs::create_dir_all(&blobs_path).await?;
        // tokio::fs::create_dir_all(&docs_path).await?;
        // println!("blobs path: {:?}", blobs_path.clone());
        println!("path: {:?}", path.clone());

        let blobs = FsStore::load(&path).await?;
        // let blobs = MemStore::default();

        let docs = Docs::persistent(path)
            .spawn(endpoint.clone(), (*blobs).clone(), gossip.clone())
            .await?;

        let author = docs.author_default().await?;

        let router = Router::builder(endpoint.clone())
            .accept(BLOBS_ALPN, BlobsProtocol::new(&blobs, endpoint.clone(), None))
            .accept(GOSSIP_ALPN, gossip.clone())
            .accept(DOCS_ALPN, docs.clone())
            .spawn();

        Ok(Self { docs, blobs, author })
    }

    pub async fn create_server(&self, server: Server) -> Result<String> {
        // create server from server struct
        let doc = self.docs.create().await?;
        println!("server docs id: {:?}", doc.id());
        let server_bytes = serde_json::to_vec(&server)?;
        let s = match str::from_utf8(&server_bytes) {
            Ok(v) => v,
            Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
        };
        let _ = doc.set_bytes(self.author.clone(), "server".to_string().into_bytes(), server_bytes.clone()).await?;
        Ok(doc.id().to_string())
    }

    pub async fn update_server(&self, id: &str, server: Server,) -> Result<String> {
        // update server with server id from server struct
        let server_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(server_id).await?.unwrap();
        let server_bytes = serde_json::to_vec(&server)?;
        println!("server docs id: {:?}", doc.id());
        let s = match str::from_utf8(&server_bytes) {
            Ok(v) => v,
            Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
        };

        // self.servers_doc.set_bytes(author_id.clone(), server.id.clone().into_bytes(), server_bytes.clone()).await?;
        let _ = doc.set_bytes(self.author.clone(), "server".to_string().into_bytes(), server_bytes.clone()).await?;
        Ok(doc.id().to_string())
    }

    pub async fn get_server(&self, id: &str) -> Result<Server> {
        // get server by id
        // println!("get server");
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");
        // let entry = doc.get_one(Query::single_latest_per_key()
        //                     .key_exact(&"server".as_bytes()))
        //                     .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"server".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        // println!("ENTRY HASH: {:?}", entry.content_hash());

        let bytes = self.blobs.get_bytes(entry.content_hash()).await.unwrap();
        let server = serde_json::from_slice(&bytes)?;
        Ok(server)
    }

    pub async fn get_all_servers(&self) -> Result<Vec<Server>, anyhow::Error> {
        let mut servers_list = Vec::new();
        let mut list = self.docs.list().await?;
        while let Some(result) = list.next().await {
            match result {
                Ok((namespace_id, capability)) => {
                    // println!("Namespace: {:?}, Capability: {:?}", namespace_id, capability);
                    let id = namespace_id.to_string();
                    let server = self.get_server(id.as_str()).await?;
                    servers_list.push(server);
                }
                Err(e) => {
                    eprintln!("Error reading stream: {:?}", e);
                }
            }
        }

        // println!("servers list: {:?}", servers_list[0].name);
        // while let Some(result) = list.next().await {
            
        // }
        Ok(servers_list)
    }

    pub async fn invite(&self, id: &str) -> Result<String> {
        println!("Running invite!");
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");
        println!("invite doc id: {:?}", doc.id().to_string());
        let ticket = doc.share(ShareMode::Read, AddrInfoOptions::RelayAndAddresses).await?;
        println!("ticket: {:?}", ticket.to_string());
        Ok(ticket.to_string())
    }

    pub async fn join_server(&self, ticket: &str) -> Result<String> {
        let doc_ticket = DocTicket::from_str(ticket)?;
        let server_doc = self.docs.import(doc_ticket.clone()).await?;
        println!("Joined new server: {:?}", server_doc.id().to_string());
        Ok(server_doc.id().to_string())
    }
}



pub struct ServerDocs {
    docs: Docs,
    // blobs: MemStore,
    blobs: FsStore,
    author: AuthorId,
    // server_docs: Vec<Doc>,
    // user_docs: vec!<Doc>,
}

impl ServerDocs {
    // Create a new ServersDb (a single document)
    pub async fn new(path: path::PathBuf) -> Result<Self> {
        let endpoint = Endpoint::builder().discovery_n0().bind().await?;

        let gossip = Gossip::builder().spawn(endpoint.clone());

        // let store = MemStore::new();

        // let blobs_path = path::PathBuf::from("C:/Users/kinga/Documents/cliqu3/iroh_blobs");
        // let docs_path = path::PathBuf::from("C:/Users/kinga/Documents/cliqu3/iroh_docs");
        // tokio::fs::create_dir_all(&blobs_path).await?;
        // tokio::fs::create_dir_all(&docs_path).await?;
        // println!("blobs path: {:?}", blobs_path.clone());
        println!("path: {:?}", path.clone());

        let blobs = FsStore::load(&path).await?;
        // let blobs = MemStore::default();

        let docs = Docs::persistent(path)
            .spawn(endpoint.clone(), (*blobs).clone(), gossip.clone())
            .await?;

        let author = docs.author_default().await?;

        let router = Router::builder(endpoint.clone())
            .accept(BLOBS_ALPN, BlobsProtocol::new(&blobs, endpoint.clone(), None))
            .accept(GOSSIP_ALPN, gossip.clone())
            .accept(DOCS_ALPN, docs.clone())
            .spawn();

        Ok(Self { docs, blobs, author })
    }

    pub async fn create_server(&self, name: &str, pic: &str, creator_address: &str) -> Result<String> {
        println!("create server");
        let creator_hash = self.creator_hash().expect("creator hash failed");
        println!("hash: {:?}", creator_hash);

        let text_channels = vec!["text channel 1".to_string(), "text channel 2".to_string()];
        let voice_channel = VoiceChannel {
            name: "voice channel 1".to_string(),
            active_users: vec!(),
        };

        let uuid = Uuid::new_v4();

        let mut voice_channels = HashMap::new();
        voice_channels.insert(uuid.to_string(), voice_channel);

        let doc = self.docs.create().await?;
        println!("server docs id: {:?}", doc.id());

        let metadata = ServerMetadata {
            id: doc.id().to_string(),
            name: name.to_string(),
            pic: pic.to_string(),
            creator_address: creator_address.to_string(),
        };

        let creator_hash_bytes = serde_json::to_vec(&creator_hash)?;
        let metadata_bytes = serde_json::to_vec(&metadata)?;
        let text_channels_bytes = serde_json::to_vec(&text_channels)?;
        let voice_channels_bytes = serde_json::to_vec(&voice_channels)?;

        // let s = match str::from_utf8(&metadata_bytes) {
        //     Ok(v) => v,
        //     Err(e) => panic!("Invalid UTF-8 sequence: {}", e),
        // };

        let _ = doc.set_bytes(self.author.clone(), "creator_hash".to_string().into_bytes(), creator_hash_bytes.clone()).await?;
        let _ = doc.set_bytes(self.author.clone(), "metadata".to_string().into_bytes(), metadata_bytes.clone()).await?;
        let _ = doc.set_bytes(self.author.clone(), "text_channels".to_string().into_bytes(), text_channels_bytes.clone()).await?;
        let _ = doc.set_bytes(self.author.clone(), "voice_channels".to_string().into_bytes(), voice_channels_bytes.clone()).await?;

        Ok(doc.id().to_string())
    }

    pub fn creator_hash(&self) -> Result<String> {
        println!("creator hash");
        let mut mac = HmacSha256::new_from_slice(self.author.as_bytes())
            .expect("HMAC can take key of any size");

        mac.update(b"cliqu3-auth");

        let result = mac.finalize().into_bytes().to_vec();
        let creator_hash = serde_json::to_string(&result)?;

        Ok(creator_hash)
    }

    pub async fn update_server_metadata(&self, id: &str, metadata: ServerMetadata) -> Result<String> {
        // update server metadata if user is the creator
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");

        let creator_hash_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"creator_hash".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let creator_hash_bytes = self.blobs.get_bytes(creator_hash_entry.content_hash()).await.unwrap();
        let stored_creator_hash: String = serde_json::from_slice(&creator_hash_bytes)?;
        let creator_hash = self.creator_hash()?;

        if creator_hash == stored_creator_hash {
            let server_id = NamespaceId::from_str(id)?;
            let doc = self.docs.open(server_id).await?.unwrap();
            let metadata_bytes = serde_json::to_vec(&metadata)?;
            println!("server docs id: {:?}", doc.id());
            let _ = doc.set_bytes(self.author.clone(), "metadata".to_string().into_bytes(), metadata_bytes.clone()).await?;
            Ok(doc.id().to_string())
        } else {
            Ok("User does not have permission to update server metadata".to_string())
        }
    }

    pub async fn get_server(&self, id: &str) -> Result<Server> {
        // get server by id
        println!("get server");
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");

        let metadata_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"metadata".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let text_channels_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"text_channels".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let voice_channels_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"voice_channels".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let metadata_bytes = self.blobs.get_bytes(metadata_entry.content_hash()).await.expect("failed to get metadata bytes from blob");
        let text_channels_bytes = self.blobs.get_bytes(text_channels_entry.content_hash()).await.expect("failed to get text_channels bytes from blob");
        let voice_channels_bytes = self.blobs.get_bytes(voice_channels_entry.content_hash()).await.expect("failed to get voice_channels bytes from blob");

        let metadata = serde_json::from_slice(&metadata_bytes).expect("failed to convert metadata bytes into json");
        let text_channels = serde_json::from_slice(&text_channels_bytes).expect("failed to convert text_channels bytes into json");
        let voice_channels = serde_json::from_slice(&voice_channels_bytes).expect("failed to convert voice_channel bytes into json");

        let server = Server {
            creator_hash: "".to_string(), // only needed to update metadata
            metadata,
            text_channels,
            voice_channels,
        };
        
        Ok(server)
    }

    pub async fn get_server_metadata(&self, id: &str) -> Result<ServerMetadata> {
        // get server by id
        println!("get server metadata");
        let namespace_id = NamespaceId::from_str(id).expect("namespace id from string failed");
        let doc = self.docs.open(namespace_id).await.expect("opening doc with id failed").expect("could not get server doc");

        let metadata_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"metadata".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let metadata_bytes = self.blobs.get_bytes(metadata_entry.content_hash()).await.expect("get bytes for blobs failed");

        let metadata: ServerMetadata = serde_json::from_slice(&metadata_bytes).expect("deserializing json failed");
        println!("metadata: {:?}", metadata.id);
        Ok(metadata)
    }

    pub async fn get_all_servers(&self) -> Result<Vec<ServerMetadata>, anyhow::Error> {
        let mut servers_list = Vec::new();
        let mut list = self.docs.list().await.expect("getting list of all docs failed");
        while let Some(result) = list.next().await {
            match result {
                Ok((namespace_id, capability)) => {
                    // println!("Namespace: {:?}, Capability: {:?}", namespace_id, capability);
                    let result = self.get_server_metadata(&namespace_id.to_string()).await;
                    match result {
                        Ok(server) => {
                            servers_list.push(server);
                        }
                        Err(e) => {
                            eprint!("getting server metadata failed");
                        }
                    }
                    // servers_list.push(server);
                }
                Err(e) => {
                    eprintln!("Error reading stream: {:?}", e);
                }
            }
        }
        // while let Some(result) = list.next().await {
            
        // }
        Ok(servers_list)
    }

    pub async fn invite(&self, id: &str) -> Result<String> {
        println!("Running invite!");
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");
        println!("invite doc id: {:?}", doc.id().to_string());
        let ticket = doc.share(ShareMode::Read, AddrInfoOptions::RelayAndAddresses).await?;
        println!("ticket: {:?}", ticket.to_string());
        Ok(ticket.to_string())
    }

    pub async fn join_server(&self, ticket: &str) -> Result<String> {
        let doc_ticket = DocTicket::from_str(ticket)?;
        let server_doc = self.docs.import(doc_ticket.clone()).await?;
        println!("Joined new server: {:?}", server_doc.id().to_string());
        Ok(server_doc.id().to_string())
    }

    pub async fn add_user_to_call(&self, id: &str, voice_channel_id: &str, user: &str) -> Result<Endpoint> {
        println!("inside add user to call: id, voice id, user");
        println!("{:?}", id.to_string());
        println!("{:?}", voice_channel_id.to_string());
        println!("{:?}", user.to_string());
        let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ROQ_ALPN.to_vec()]).bind().await?;
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");

        let voice_channels_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"voice_channels".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let voice_channels_bytes = self.blobs.get_bytes(voice_channels_entry.content_hash()).await.unwrap();
        let mut voice_channels: HashMap<String, VoiceChannel> = serde_json::from_slice(&voice_channels_bytes)?;

        let mut voice_channel = voice_channels.get(voice_channel_id).unwrap().clone();
        // voice_channel.active_users.push(user.to_string());
        println!("node id: {:?}", endpoint.node_id().clone().to_string());
        voice_channel.active_users.push(endpoint.node_id().to_string());

        voice_channels.insert(voice_channel_id.to_string(), voice_channel);

        let voice_channels_bytes = serde_json::to_vec(&voice_channels)?;

        let _ = doc.set_bytes(self.author.clone(), "voice_channels".to_string().into_bytes(), voice_channels_bytes.clone()).await?;

        Ok(endpoint)
    }

    pub async fn remove_user_from_call(&self, id: &str, voice_channel_id: &str, user: &str) -> Result<()> {
        println!("inside remove user to call: id, voice id, user");
        println!("{:?}", id.to_string());
        println!("{:?}", voice_channel_id.to_string());
        println!("{:?}", user.to_string());
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");

        let voice_channels_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"voice_channels".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let voice_channels_bytes = self.blobs.get_bytes(voice_channels_entry.content_hash()).await.unwrap();
        let mut voice_channels: HashMap<String, VoiceChannel> = serde_json::from_slice(&voice_channels_bytes)?;

        let mut voice_channel = voice_channels.get(voice_channel_id).unwrap().clone();
        let _ = voice_channel.active_users.retain(|x| x != &user.to_string());

        voice_channels.insert(voice_channel_id.to_string(), voice_channel);

        let voice_channels_bytes = serde_json::to_vec(&voice_channels)?;

        let _ = doc.set_bytes(self.author.clone(), "voice_channels".to_string().into_bytes(), voice_channels_bytes.clone()).await?;

        Ok(())
    }

    pub async fn get_caller_id(&self, id: &str, voice_channel_id: &str) -> Result<String> {
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");

        let voice_channels_entry = doc.get_one(Query::single_latest_per_key()
                            .key_exact(&"voice_channels".as_bytes()))
                            .await?.ok_or_else(|| anyhow!("Entry not found"))?;

        let voice_channels_bytes = self.blobs.get_bytes(voice_channels_entry.content_hash()).await.unwrap();
        let voice_channels: HashMap<String, VoiceChannel> = serde_json::from_slice(&voice_channels_bytes)?;

        let voice_channel = voice_channels.get(voice_channel_id).unwrap().clone();

        Ok(voice_channel.active_users[0].clone())
    }

    pub async fn set_current_server(&self, id: &str, app: tauri::AppHandle) -> Result<()> {
        println!("inside set_current_server");
        let namespace_id = NamespaceId::from_str(id)?;
        let doc = self.docs.open(namespace_id).await.unwrap().expect("could not get server doc");
        let mut subscription = doc.subscribe().await.expect("subscription failed");

        println!("after subscription in set_current_server");
        let app_handle = app.clone();

        let blobs = self.blobs.clone();

        tokio::spawn(async move {
            while let Some(result) = subscription.next().await {
                match result {
                    // Ok(event) => match event {
                    Ok(event) => {
                        let payload = match &event {
                            LiveEvent::InsertLocal { entry } => {
                                let bytes = blobs.get_bytes(entry.content_hash()).await.expect("failed to get entry bytes from blob");
                                let data: serde_json::Value = serde_json::from_slice(&bytes).expect("failed to convert bytes into json");
                                let payload = serde_json::json!({
                                    "event": format!("{:?}", event),
                                    "data": data // or parse if structured
                                });

                                println!("updated entry payload: {:?}", payload.to_string());

                                let _ = app_handle.emit("iroh_event", payload).expect("failed to emit iroh event");
                            },
                            LiveEvent::InsertRemote { .. } => {},
                            LiveEvent::ContentReady { .. } => {},
                            LiveEvent::PendingContentReady => {},
                            LiveEvent::NeighborUp(_) => {},
                            _ => {},
                        };

                        // if let Err(e) = app_handle.emit("iroh_event", payload.to_string()) {
                        //     eprintln!("Failed to emit event: {:?}", e);
                        // }

                        // LiveEvent::InsertLocal { .. } => {
                        //     println!("Local change inserted");
                        // }
                        // LiveEvent::InsertRemote { .. } => {
                        //     println!("Remote change inserted");
                        // }
                        // LiveEvent::ContentReady { .. } => {
                        //     println!("Document content is ready");
                        // }
                        // LiveEvent::PendingContentReady => {
                        //     println!("Waiting for content...");
                        // }
                        // LiveEvent::NeighborUp(peer_id) => {
                        //     println!("A neighbor came online: {:?}", peer_id);
                        // }
                        // _ => {}
                    },
                    Err(e) => {
                        eprintln!("Error in subscription: {:?}", e);
                    }
                }
            }   
        });

        Ok(())
    }
}
