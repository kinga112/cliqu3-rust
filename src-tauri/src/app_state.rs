// use crate::{call::handler::CallHandler, iroh::{call::Call, cliqu3db::{Cliqu3Db, ServerDocs}}};
use crate::{call::handler::CallHandler, iroh::cliqu3db::ServerDocs};
use std::sync::Arc;
use anyhow::{Ok, Result};
use tokio::sync::Mutex;

pub struct AppState {
    pub user: Option<String>,
    // pub db: Option<Arc<Cliqu3Db>>,
    pub db: Option<Arc<Mutex<ServerDocs>>>,
    // pub call: Call,
    pub call: CallHandler,
    // pub wc: WalletConnectHandler,
}

impl AppState {
    pub fn default() -> Self {
        // let call = Call::new();
        let call = CallHandler::new();
        // let wc = WalletConnectHandler::new();
        Self { user: None, db: None, call }
    }

    // pub fn init_db(&mut self, db: Cliqu3Db) -> Result<()> {
    //     self.db = Some(Arc::new(db));
    //     Ok(())
    // }

    pub fn init_db(&mut self, db: ServerDocs) -> Result<()> {
        self.db = Some(Arc::new(Mutex::new(db)));
        Ok(())
    }

    pub fn init_user(&mut self, user: String) {
        self.user = Some(user);
    }

    // pub async fn get_wc_uri(&self, uri: String) -> String {
    //     // self.wc_uri = Some(uri);
    //     let uri = self.wc.get_uri().await.expect("couldnt get uri");
    //     uri
    // }
}
