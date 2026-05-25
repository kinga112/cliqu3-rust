use crate::config;
use crate::walletconnect_test::signer::WalletConnectXmtpSigner;
use alloy::ens;
use alloy::providers::Provider;
use alloy::{
    ens::EnsResolver, ens::ProviderEnsExt, primitives::address, providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
};

use reqwest::Url;
use serde::{Deserialize, Serialize};
use std::any::Any;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Emitter;
use xmtp::content::ReactionAction;
use xmtp::{
    AccountIdentifier, AlloySigner, Client, ConsentState, Conversation, CreateGroupOptions, Env,
    IdentifierKind, Message, MessageEvent, Recipient, Signer,
};

#[derive(Serialize, Deserialize)]
pub struct Chat {
    id: String,
    name: Option<String>,
    description: Option<String>,
    // creator: String,
    messages: Vec<Msg>,
    // admins:
    // members: Vec<String>,
    members: HashMap<String, MemberProfile>,
    // reactions
}

#[derive(Serialize, Deserialize)]
pub struct Msg {
    id: String,
    content: String,
    content_type: String,
    from: String,
    timestamp: i64,
}

#[derive(Serialize, Deserialize)]
pub struct MemberProfile {
    pub address: String,
    pub name: String,
    pub avatar: String,
    pub description: String,
}

pub struct XMTP {
    pub client: Client,
}

impl XMTP {
    pub fn new(
        signer_opt: Option<Arc<WalletConnectXmtpSigner>>,
        address_opt: Option<String>,
    ) -> Self {
        // let db_path = format!("{}/xmtp_{}.db3", config::BASE_FILE_LOCATION, signer.address);

        // println!("Initializing XMTP client with db_path: {}", db_path);
        if signer_opt.is_none() && address_opt.is_none() {
            panic!("failed to init xmtp");
        }

        // let client: Client;

        // if let Some(signer) = signer_opt {
        //     let db_path = format!("{}/xmtp_{}.db3", config::BASE_FILE_LOCATION, signer.address);
        //     client = Client::builder()
        //         .env(Env::Dev)
        //         // .encryption_key(encryption_key)
        //         .db_path(&db_path)
        //         .build(&*signer)
        //         .expect("client failed");
        // } else {
        //     // if let Some(address) = address_opt {
        //     let address = address_opt.unwrap();
        //     let db_path = format!("{}/xmtp_{}.db3", config::BASE_FILE_LOCATION, address);
        //     client = Client::builder()
        //         .env(Env::Dev)
        //         // .encryption_key(encryption_key)
        //         .db_path(&db_path)
        //         .build_existing(&address, IdentifierKind::Ethereum)
        //         .expect("client failed");
        //     // }
        // }

        // TEMP SIGNER WITH PRIVATE KEY FOR CLIQU3 CONTRACT TESTING
        let private_key_signer: PrivateKeySigner = config::PRIVATE_KEY
            .parse()
            .expect("failed to create signer");

        let xmtp_signer = AlloySigner::from(private_key_signer);
        let signer_trait_ref: &dyn Signer = &xmtp_signer;
        // let xmtp_signer = AlloySigner::from(private_key_signer);

        let db_path = format!(
            "{}/xmtp_{}.db3",
            config::BASE_FILE_LOCATION,
            &xmtp_signer.address()
        );
        let client = Client::builder()
            .env(Env::Dev)
            .db_path(db_path)
            .build(signer_trait_ref)
            .expect("failed to init xmtp client");

        client.sync_welcomes().expect("failed to sync on start");
        let consent_states = [
            ConsentState::Allowed,
            ConsentState::Denied,
            ConsentState::Unknown,
        ];
        let result = client.sync_all(&consent_states).expect("");
        println!("Sync all result: {:?}", result);
        // let c = Client::builder().build_existing(address, kind);
        Self { client }
    }

    pub fn init_stream(&self, app: tauri::AppHandle) {
        let consent_states = vec![ConsentState::Allowed, ConsentState::Unknown];
        let handle =
            xmtp::stream::messages(&self.client, None, &consent_states).expect("stream failed");

        tokio::task::spawn_blocking(move || {
            while let Some(event) = handle.recv() {
                println!("event: {:?}", event);

                let payload = serde_json::json!({
                    "conversation_id": event.conversation_id,
                    "message_id": event.message_id,
                });

                app.emit("xmtp_stream_event", payload)
                    .expect("failed to emit iroh event");
            }
        });
    }

    pub fn create_group(
        &self,
        members: &[Recipient],
        name: Option<String>,
        description: Option<String>,
        image_url: Option<String>,
    ) -> Result<String, String> {
        println!("creating new group: {:?}", name);
        let opts = CreateGroupOptions {
            permissions: None,
            name: name,
            description: description,
            image_url: image_url,
            app_data: None,
            disappearing: None,
        };

        // let m: Vec<Recipient> = vec![];

        let convo = self
            .client
            .group(members, &opts)
            .expect("failed to create xmtp group");
        println!("created new group: {:?}", convo.id());
        Ok(convo.id())
    }

    // pub fn get_conversation(&self, id: &str) -> Result<Conversation, String> {
    pub fn get_conversation(&self, id: &str) -> Result<Chat, String> {
        let convo = self
            .client
            .conversation(id)
            .expect("failed to get convo")
            .expect("convo doesnt exist with id");
        // let a = convo.metadata();
        // println!(
        //     "members: {:?}",
        //     convo.members().expect("failed to get members")
        // );
        // let mut members: Vec<String> = vec![];
        // for member in convo.members().expect("failed to get members") {
        //     let address = member.account_identifiers[0];
        //     members.push(address);
        // }
        //

        // let members: Vec<String> = convo
        //     .members()
        //     .expect("failed to get members")
        //     .into_iter()
        //     .filter_map(|m| m.account_identifiers.get(0).map(|id| id.to_string()))
        //     .collect();

        let mut member_profiles: HashMap<String, MemberProfile> = HashMap::new();
        let members = convo.members().expect("failed to get members");
        for member in members {
            let address = member
                .account_identifiers
                .get(0)
                .map(|id| id.to_string())
                .expect("failed to get address");
            let profile = MemberProfile {
                address: address,
                name: "".to_string(),
                avatar: "".to_string(),
                description: "".to_string(),
            };
            member_profiles.insert(member.inbox_id, profile);
        }

        // let m = convo.members().expect("failed to get members");
        // println!("member 1: {:?}", m[0]);

        let mut messages = vec![];
        for message in convo.messages().expect("failed to get messages") {
            let msg = self.get_msg(message).expect("failed to decode message");
            messages.push(msg);
            // if let Some(content) = raw.split("UTF-8\" ").last() {
            //     messages.push(Msg {
            //         id: message.id,
            //         content: content.to_string(),
            //         content_type: message.content_type.unwrap_or("none".to_string()),
            //         from: message.sender_installation_id,
            //         timestamp: timestamp,
            //     });
            // }
        }

        // let creator = convo.metadata();
        // println!("metadata: {:?}", creator);

        // let msgs = convo.messages.expect("")

        // let convo_json = serde_json::json!({
        //     "id": convo.id(),
        //     "name": convo.name(),
        //     "description": convo.description(),
        //     "members": members,
        //     "messages": messages,
        // })
        // .to_string();
        // let metadata = convo.metadata().expect("failed to get metadata");
        // println!("creator: {:?}", metadata.creator_inbox_id);

        let chat = Chat {
            id: convo.id(),
            name: convo.name(),
            description: convo.description(),
            // creator: creator,
            messages: messages,
            members: member_profiles,
            // messages: convo.messages().expect("failed to get messages"),
            // creator: convo
            //     .metadata()
            //     .expect("failed to get convo metadata")
            //     .creator_inbox_id,
        };

        Ok(chat)
        // Ok(convo)
    }

    pub fn get_msg(&self, message: Message) -> Result<Msg, String> {
        let msg: Msg;
        let timestamp = message.sent_at_ns;
        let content = message.decode().expect("failed to decode message");
        // println!("Message: {:?}", message);
        if content.is_text() {
            let text = content
                .as_text()
                .expect("failed to get content")
                .to_string();
            msg = Msg {
                id: message.id,
                content: text,
                content_type: "text".to_string(),
                from: message.sender_inbox_id,
                timestamp: timestamp,
            };
        } else if content.is_reply() {
            let reply = content.as_reply().expect("failed to get content");
            msg = Msg {
                id: message.id,
                content: "".to_string(),
                content_type: "reply".to_string(),
                from: message.sender_inbox_id,
                timestamp: timestamp,
            };
        } else if content.is_attachment() {
            let attachement = content.as_attachment().expect("failed to get content");
            msg = Msg {
                id: message.id,
                content: "".to_string(),
                content_type: "attachement".to_string(),
                from: message.sender_inbox_id,
                timestamp: timestamp,
            };
        } else if content.is_reaction() {
            let reaction = content.as_reaction().expect("failed to get content");
            msg = Msg {
                id: message.id,
                content: "".to_string(),
                content_type: "reaction".to_string(),
                from: message.sender_inbox_id,
                timestamp: timestamp,
            };
        } else {
            msg = Msg {
                id: message.id,
                content: "".to_string(),
                content_type: "reaction".to_string(),
                from: message.sender_inbox_id,
                timestamp: timestamp,
            }
        }
        Ok(msg)
    }

    pub fn get_conversations(&self) -> Result<Vec<Conversation>, String> {
        let convos = self
            .client
            .conversations()
            .expect("failed to list conversations");
        Ok(convos)
    }

    pub fn send_message(&self, id: &str, text: &str) {
        let convo = self
            .client
            .conversation(id)
            .expect("failed to get convo")
            .expect("convo doesnt exist with id");
        let result = convo.send_text(text);
    }

    pub fn send_reaction(&self, id: &str, message_id: &str, emoji: &str, action: ReactionAction) {
        let convo = self
            .client
            .conversation(id)
            .expect("failed to get convo")
            .expect("convo doesnt exist with id");
        let result = convo.send_reaction(message_id, emoji, action);
    }

    pub fn send_text_reply(&self, id: &str, message_id: &str, text: &str) {
        let convo = self
            .client
            .conversation(id)
            .expect("failed to get convo")
            .expect("convo doesnt exist with id");
        let result = convo.send_text_reply(message_id, text);
    }

    pub fn verify_can_message(&self, address: String) -> Result<bool, String> {
        let identifier = AccountIdentifier {
            address,
            kind: IdentifierKind::Ethereum,
        };
        let can_message = self
            .client
            .can_message(&[identifier])
            .expect("failed to verify 'can_message'");
        Ok(can_message[0])
    }

    pub fn get_ens_name(&self, address: &str) {
        // println!("address: {}", address);
        // self.client.reverse_resolve(address)
        // let rpc_url = "https://reth-ethereum.ithaca.xyz/rpc";
        // let rpc_url = "https://eth.llamarpc.com";
        let rpc_url = Url::parse("https://eth.drpc.org").expect("failed to parse rpc url");
        // .parse()
        // .expect("failed to parse rpc url");
        // let provider = ProviderBuilder::new().connect(s);
        let provider = ProviderBuilder::new().connect_http(rpc_url);

        // Vitalik's Ethereum address.
        let vitalik_address = address!("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");

        // let ens_name = ens::reverse_address(&vitalik_address);

        // Perform reverse ENS lookup to get the ENS name for the address.
        // let name = provider
        //
        //

        tokio::spawn(async move {
            let ens_name = provider
                .lookup_address(&vitalik_address)
                .await
                .expect("failed to lookup address");
            println!("Address {vitalik_address} resolves to: {ens_name:?}");
            // let provider = Provider::<Http>::try_from("https://eth.llamarpc.com")?;

            let avatar = provider
                .lookup_txt(&ens_name, "avatar")
                .await
                .expect("no avatar");

            let header = provider
                .lookup_txt(&ens_name, "header")
                .await
                .expect("no header");

            let description = provider
                .lookup_txt(&ens_name, "description")
                .await
                .expect("no description");
            println!("avatar: {:?}", avatar);
            println!("header: {:?}", header);
            println!("description: {:?}", description);
            // Resolve ENS name to Address
            // let name = "vitalik.eth";
            // let address = provider.resolve_name(name).await?;

            // Lookup ENS name given Address
            // let resolved_name = provider.lookup_address(address).await?;
            // println!("NAME: {:?}", resolved_name);
            // let a = provider.get_resolver(node, error_name);
            // let b =
        });
        // let ens_name = provider
        //     .lookup_address(&vitalik_address)
        //     .await
        //     .expect("failed to loopup address");

        // println!("Address {vitalik_address} resolves to: {ens_name:?}");
        // Some(ens_name)
        // Ok(ens_name)
    }
}
