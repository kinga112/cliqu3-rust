use base64;
use std::{collections::HashMap, sync::Arc};
use {
    alloy::hex,
    futures_util::TryStreamExt as _,
    rand::RngCore,
    reown_relay_client::{
        ConnectionOptions,
        error::ClientError,
        websocket::{Client, CloseFrame, ConnectionHandler, PublishedMessage},
    },
    reown_relay_rpc::{
        auth::{AuthToken, ed25519_dalek::SigningKey, ed25519_dalek::VerifyingKey},
        domain::Topic,
    },
    sha2::{Digest, Sha256},
    std::time::Duration,
    url::Url,
};

use tokio::sync::mpsc;
use tokio::sync::mpsc::{Receiver, Sender};

use x25519_dalek::{EphemeralSecret, PublicKey as XPublicKey};

use chacha20poly1305::{
    ChaCha20Poly1305, Key, Nonce,
    aead::{Aead, KeyInit},
};

use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

struct Handler {
    name: &'static str,
    pairing_topic: String,
    sym_key: String,
    tx: Sender<String>,
}

impl Handler {
    fn new(name: &'static str, pairing_topic: String, sym_key: String, tx: Sender<String>) -> Self {
        Self {
            name,
            pairing_topic,
            sym_key,
            tx,
        }
    }

    fn decrypt_message(&self, message_b64: &str) -> String {
        let buffer = base64::decode(message_b64).expect("Failed to decode base64 message");
        if buffer.is_empty() {
            panic!("Empty message");
        }

        match buffer[0] {
            0 => self.decrypt_type_0_envelope(message_b64),
            1 => {
                let (wallet_pub_key_hex, json_payload) = self.decrypt_type_1_envelope(message_b64);
                println!(
                    "Decrypted Type 1 envelope with wallet pub key: {}",
                    wallet_pub_key_hex
                );
                json_payload
            }
            _ => panic!("Unknown envelope type: {}", buffer[0]),
        }
    }

    fn decrypt_type_0_envelope(&self, message_b64: &str) -> String {
        let buffer = base64::decode(message_b64).expect("Failed to decode base64 message");
        if buffer.is_empty() || buffer[0] != 0 {
            panic!("Not a Type 0 envelope. Use Type 1 function instead.");
        }
        let nonce_bytes = &buffer[1..13];
        let ciphertext = &buffer[13..];
        let key_bytes = hex::decode(&self.sym_key).expect("Invalid hex key");
        let key = Key::from_slice(&key_bytes);
        let cipher = ChaCha20Poly1305::new(key);
        let nonce = Nonce::from_slice(nonce_bytes);
        let plaintext_bytes = cipher
            .decrypt(nonce, ciphertext)
            .expect("Failed to decrypt");
        String::from_utf8(plaintext_bytes).expect("Failed to parse decrypted bytes as UTF-8")
    }

    fn decrypt_type_1_envelope(&self, message_b64: &str) -> (String, String) {
        let buffer = base64::decode(message_b64).expect("Failed to decode base64 message");
        if buffer.is_empty() || buffer[0] != 1 {
            panic!("Not a Type 1 envelope. Use Type 0 function instead.");
        }
        let wallet_pub_key_bytes = &buffer[1..33];
        let iv_bytes = &buffer[33..45];
        let sealbox = &buffer[45..];
        let key_bytes = hex::decode(&self.sym_key).expect("Invalid hex key");
        let key = Key::from_slice(&key_bytes);
        let cipher = ChaCha20Poly1305::new(key);
        let nonce = Nonce::from_slice(iv_bytes);
        let plaintext_bytes = cipher.decrypt(nonce, sealbox).expect("Failed to decrypt");
        let json_payload =
            String::from_utf8(plaintext_bytes).expect("Failed to parse decrypted bytes as UTF-8");
        let wallet_pub_key_hex = hex::encode(wallet_pub_key_bytes);
        (wallet_pub_key_hex, json_payload)
    }
}

impl ConnectionHandler for Handler {
    fn connected(&mut self) {
        println!("[{}] connection open", self.name);
    }

    fn disconnected(&mut self, frame: Option<CloseFrame>) {
        println!("[{}] connection closed: frame={frame:?}", self.name);
    }

    fn message_received(&mut self, message: PublishedMessage) {
        let msg: String;
        if message.topic.to_string() == self.pairing_topic {
            msg = self.decrypt_message(&message.message.as_ref());
        } else {
            println!(
                "[{}] message received not pairing topic: tag={}",
                self.name, message.tag
            );
            msg = message.message.to_string();
        }
        // println!("[{}] decrypted message: {}", self.name, msg);
        let tx = self.tx.clone();
        tokio::spawn(async move {
            println!(
                "Received message in handler, sending through channel: {}",
                msg
            );
            if let Err(e) = tx.send(msg).await {
                eprintln!("Failed to send message through channel: {}", e);
            }
        });
    }

    fn inbound_error(&mut self, error: ClientError) {
        println!("[{}] inbound error: {error}", self.name);
    }

    fn outbound_error(&mut self, error: ClientError) {
        println!("[{}] outbound error: {error}", self.name);
    }
}

pub struct WalletConnectHandler {
    pub uri: String,
    pub client: Client,
    // pub secret: EphemeralSecret,
    public_key: XPublicKey,
}

impl WalletConnectHandler {
    pub fn new(tx: Sender<String>, public_key: XPublicKey) -> Self {
        // let secret = EphemeralSecret::random_from_rng(&mut rand::thread_rng());

        let mut raw_key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut raw_key);
        let sym_key_hex = hex::encode(raw_key);

        // 2. Generate the Topic (SHA-256 hash of the raw key bytes)
        let mut hasher = Sha256::new();
        hasher.update(&raw_key);
        let topic_hex = hex::encode(hasher.finalize());

        // 3. Set expiry to 1 hour in the future (3600s)
        // This provides a safety buffer for testing
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let expiry = now + 3600;

        // 4. Define required methods (Essential for 2026 wallets)
        // Most wallets won't send a response if this is missing or empty.
        let methods = "[wc_sessionPropose]";

        // 5. Construct the final URI
        let uri = format!(
            "wc:{}@2?expiryTimestamp={}&relay-protocol=irn&symKey={}&methods={}",
            topic_hex, expiry, sym_key_hex, methods
        );

        // let (tx, rx) = mpsc::channel(100);

        let handler = Handler::new("app_client", topic_hex.clone(), sym_key_hex.clone(), tx);
        let client = Client::new(handler);
        // let handler =  Self { client, uri, secret };
        // (handler, rx)
        Self {
            client,
            uri,
            public_key,
        }
    }

    pub async fn connect(&self) {
        let (topic, sym_key_hex) = self
            .parse_wc_uri(&self.uri)
            .expect("Failed to parse WC URI");
        let key = SigningKey::generate(&mut rand::thread_rng());
        // println!("Generated signing key for JWT: {:?}", key);
        // let aud = Url::parse("https://relay.walletconnect.com/rpc")
        //     .unwrap()
        //     .origin()
        //     .unicode_serialization();
        // println!("Parsed audience for JWT: {}", aud);
        let auth = AuthToken::new("https://cliqu3.com")
            .aud("wss://relay.walletconnect.com")
            .ttl(Duration::from_secs(60 * 60))
            .as_jwt(&key)
            .expect("Failed to create JWT");
        println!("Generated JWT for authentication: {}", auth);
        let opts = ConnectionOptions::new("418defda3aa82cefc151946c325b1bdf", auth)
            .with_address("wss://relay.walletconnect.com");
        self.client
            .connect(&opts)
            .await
            .expect("failed to connect client");
        let topic_1 = Topic::from(topic.clone());
        let a = self
            .client
            .subscribe(topic_1)
            .await
            .expect("failed to subscribe to topic");
        println!("Subscribed with sub id: {:?}", a);
        // let secret = EphemeralSecret::random_from_rng(&mut rand::thread_rng());
        // let public_key = XPublicKey::from(&self.secret);
        let public_key_hex = hex::encode(self.public_key.as_bytes());
        let id = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        println!("id: {}, public key: {}", id, public_key_hex);
        let proposal_json = serde_json::json!({
            "id": id,
            "jsonrpc": "2.0",
            "method": "wc_sessionPropose",
            "params": {
                "relays": [{"protocol": "irn"}],
                "proposer": {
                    "publicKey": public_key_hex,
                    "metadata": {
                        "name": "Cliqu3",
                        "description": "Web3 Messaging",
                        "url": "https://cliqu3.com",
                        "icons": ["https://avatars.githubusercontent.com/u/37784886"]
                    }
                },
                "requiredNamespaces": {
                    "eip155": {
                        "methods": ["eth_sendTransaction", "personal_sign"],
                        "chains": ["eip155:1"], // Ethereum Mainnet
                        "events": ["accountsChanged", "chainChanged"]
                    }
                },
                "optionalNamespaces": {
                    "eip155": {
                        "methods": ["eth_sendTransaction", "personal_sign"],
                        "chains": ["eip155:1"],
                        "events": ["accountsChanged", "chainChanged"]
                    }
                }
            }
        })
        .to_string();
        let topic_3 = Topic::from(topic.clone());
        let envelope_bytes = self.encrypt_to_envelope_raw(&proposal_json, &sym_key_hex);
        let message_b64 = base64::encode(envelope_bytes);
        println!("Encrypted proposal message: {:?}", message_b64);
        println!("Publishing session proposal to topic:");
        self.client
            .publish(
                topic_3,
                Arc::from(message_b64),
                None,
                1100,
                Duration::from_secs(300),
                true,
            )
            .await
            .expect("failed to public message");
        println!("Published session proposal");
    }

    pub fn encrypt_to_envelope_raw(&self, json_payload: &str, sym_key_hex: &str) -> Vec<u8> {
        let key_bytes = hex::decode(sym_key_hex).expect("Invalid sym_key hex");
        let key = Key::from_slice(&key_bytes);
        let cipher = ChaCha20Poly1305::new(key);

        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt JSON payload
        let ciphertext = cipher
            .encrypt(nonce, json_payload.as_bytes())
            .expect("Encryption failed");

        // Construct the Type 0 Envelope: [0] + [12 bytes nonce] + [ciphertext]
        let mut envelope = Vec::with_capacity(1 + 12 + ciphertext.len());
        envelope.push(0u8);
        envelope.extend_from_slice(&nonce_bytes);
        envelope.extend_from_slice(&ciphertext);

        envelope
    }

    pub fn create_uri(&self) -> (String, String, String) {
        // 1. Generate 32 random bytes for the Symmetric Key
        let mut raw_key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut raw_key);
        let sym_key_hex = hex::encode(raw_key);

        // 2. Generate the Topic (SHA-256 hash of the raw key bytes)
        let mut hasher = Sha256::new();
        hasher.update(&raw_key);
        let topic_hex = hex::encode(hasher.finalize());

        // 3. Set expiry to 1 hour in the future (3600s)
        // This provides a safety buffer for testing
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let expiry = now + 3600;

        // 4. Define required methods (Essential for 2026 wallets)
        // Most wallets won't send a response if this is missing or empty.
        let methods = "[wc_sessionPropose]";

        // 5. Construct the final URI
        let uri = format!(
            "wc:{}@2?expiryTimestamp={}&relay-protocol=irn&symKey={}&methods={}",
            topic_hex, expiry, sym_key_hex, methods
        );

        (uri, topic_hex, sym_key_hex)
    }

    pub fn parse_wc_uri(&self, uri: &str) -> Result<(String, String), String> {
        // 1. Parse the string into a URL object
        let parsed_url = Url::parse(uri).map_err(|e| format!("Invalid URL: {}", e))?;

        // 2. Validate Scheme
        if parsed_url.scheme() != "wc" {
            return Err("Not a WalletConnect URI".to_string());
        }
        // 3. Extract Topic from the path (remove "wc:" prefix and split by '@')
        let topic = uri
            .strip_prefix("wc:")
            .and_then(|s| s.split('@').next())
            .ok_or("Invalid WC URI format")
            .expect("Failed to extract topic from URI")
            .to_string();
        // 4. Extract Query Parameters
        let query_params: HashMap<String, String> = parsed_url.query_pairs().into_owned().collect();

        let sym_key = query_params
            .get("symKey")
            .cloned()
            .ok_or("Missing symKey in URI")?;

        println!("Parsed topic: {}, symKey: {}", topic, sym_key);
        Ok((topic, sym_key))
    }

    pub fn listen(&self, mut rx: Receiver<String>, secret: EphemeralSecret) {
        // let client = self.client.clone();
        // let secret = self.secret.clone();
        tokio::spawn(async move {
            while let Some(message) = rx.recv().await {
                println!("Received message in listener: {}", message);
                let map: HashMap<String, String> =
                    serde_json::from_str(&message).expect("Failed to parse message JSON");
                let responder_bytes =
                    hex::decode(map.get("responderPublicKey").expect("no key in map"))
                        .expect("Failed to decode responder public key from hex");
                let wallet_public = XPublicKey::from(
                    <[u8; 32]>::try_from(responder_bytes).expect("Invalid length"),
                );

                // 2. Derive the Shared Secret
                // 'self.secret' is the EphemeralSecret you've been holding
                // let shared_secret = self.secret.diffie_hellman(&wallet_public);
                // let session_key_bytes = shared_secret.as_bytes(); // 32 bytes

                // 3. Generate the New Session Topic (SHA-256 hash of the session key)
                // let mut hasher = Sha256::new();
                // hasher.update(session_key_bytes);
                // let session_topic = hex::encode(hasher.finalize());
            }
        });
    }
}
