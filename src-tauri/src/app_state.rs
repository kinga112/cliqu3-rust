// use crate::{call::handler::CallHandler, iroh::{call::Call, cliqu3db::{Cliqu3Db, ServerDocs}}};
use crate::walletconnect_test::crypto;
use crate::{
    cache::Moka, call::handler::CallHandler, config, iroh::cliqu3db::ServerDocs, xmtp::XMTP,
};

// use crate::walletconnect_test::rx_listener::receive_and_reply;
// use crate::temp_signer::WalletConnectXmtpSigner;
use crate::walletconnect_test::signer::WalletConnectXmtpSigner;
// use crate::walletconnect::WalletConnectHandler;
use crate::walletconnect_test::walletconnect::WalletConnectHandler;
use aes_gcm::{
    Aes256Gcm, Key, Nonce,
    aead::{Aead, KeyInit, OsRng, Payload},
};
use anyhow::{Error, Ok, Result};
use chacha20poly1305::{ChaCha20Poly1305, Key as ChaChaKey};
use hkdf::Hkdf;
use iroh::discovery::pkarr;
use keyring::Entry;
use rand::{RngCore, thread_rng};
use reown_relay_rpc::domain::Topic;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{
    collections::HashMap,
    fs,
    path::{self, PathBuf},
    sync::Arc,
};
use tauri::Emitter;
use tokio::sync::{Mutex, mpsc, oneshot};
use x25519_dalek::{EphemeralSecret, PublicKey};
use {
    alloy::hex,
    sha2::{Digest, Sha256},
};

pub struct AppState {
    pub user: Option<String>,
    pub db: Option<Arc<Mutex<ServerDocs>>>,
    pub call: CallHandler,
    pub cache: Moka,
    pub xmtp: Option<XMTP>,
}

impl AppState {
    pub fn default() -> Self {
        // let call = Call::new();
        let call = CallHandler::new();
        let cache = Moka::default();

        Self {
            user: None,
            db: None,
            call,
            cache,
            xmtp: None,
        }
    }

    pub fn login(&mut self) -> Result<()> {
        // println!("running login. address: {:?}", address);
        // self.user = Some(address.to_string());
        if self.xmtp.is_none() {
            return Ok(());
        }

        let address = self.xmtp.as_ref().unwrap().client.account_identifier()?;
        let entry = Entry::new("cliqu3", "cliqu3 user").expect("failed to create keyring entry");
        entry
            .set_secret(address.as_bytes())
            .expect("failed to set random key in keyring");

        Ok(())
    }

    pub fn logout(&mut self) -> Result<()> {
        if let Some(user) = &self.user {
            let entry =
                Entry::new("cliqu3", "cliqu3 user").expect("failed to create keyring entry");
            entry
                .delete_credential()
                .expect("failed to delete password from keyring");
        }
        self.user = None;
        self.db = None;
        Ok(())
    }

    pub fn check_saved_user(&mut self) -> Result<String> {
        println!("check_saved_user");
        let entry = Entry::new("cliqu3", "cliqu3 user").expect("failed to create keyring entry");
        let key = entry
            .get_secret()
            .expect("failed to get password from keyring");
        let address = String::from_utf8(key)?;
        println!("address of saved user: {:?}", address);
        let xmtp = XMTP::new(None, Some(address.clone()));
        let inbox_id = xmtp
            .client
            .inbox_id()
            .expect("failed to get inbox id for client");
        self.xmtp = Some(xmtp);
        // Ok(address)
        Ok(inbox_id)
    }

    // pub fn init_db(&mut self, db: ServerDocs) -> Result<()> {
    pub async fn init_db(&mut self) -> Result<()> {
        let path_str = format!(
            "{}/{}",
            config::BASE_FILE_LOCATION,
            self.user.clone().unwrap_or("default".to_string())
        );
        let path = path::PathBuf::from(path_str);
        let db = ServerDocs::new(path)
            .await
            .map_err(|e| format!("couldn't init cliqu3 db: {e}"))
            .expect("failed");
        self.db = Some(Arc::new(Mutex::new(db)));
        Ok(())
    }

    pub fn init_user(&mut self, user: String) {
        self.user = Some(user);
    }

    pub fn create_wc_uri(&mut self) -> String {
        let mut raw_key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut raw_key);
        let sym_key_hex = hex::encode(raw_key);
        let mut hasher = Sha256::new();
        hasher.update(&raw_key);
        let pairing_topic_hex = hex::encode(hasher.finalize());
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let expiry = now + 3600;
        let methods = "[wc_sessionPropose]";
        let uri = format!(
            "wc:{}@2?expiryTimestamp={}&relay-protocol=irn&symKey={}&methods={}",
            pairing_topic_hex, expiry, sym_key_hex, methods
        );

        uri
    }

    pub async fn init_wallet_connect(&mut self, uri: String, app: tauri::AppHandle) {
        let mut wc = WalletConnectHandler::new(uri);

        // use to receive xmtp from spawned tasks
        let (xmtp_tx, xmtp_rx) = oneshot::channel();

        wc.init(xmtp_tx).await;

        let xmtp = xmtp_rx.await.expect("failed to get xmtp in receiver");
        let id = xmtp.client.inbox_id().expect("couldnt get xmtp inbox id");
        println!("GOT XMTP INBOX ID IN APP STATE: {:?}", id);
        self.xmtp = Some(xmtp);

        let _ = self.login();

        let payload = serde_json::json!({
            "data": "authenticated"
        });

        app.emit("wc_response", payload)
            .expect("failed to emit iroh event");
    }
}
