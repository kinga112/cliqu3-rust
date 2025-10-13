// use crate::{call::handler::CallHandler, iroh::{call::Call, cliqu3db::{Cliqu3Db, ServerDocs}}};
use crate::{call::handler::CallHandler, iroh::cliqu3db::ServerDocs};
use std::sync::Arc;
use anyhow::{Ok, Result};

pub struct AppState {
    pub user: String,
    // pub db: Option<Arc<Cliqu3Db>>,
    pub db: Option<Arc<ServerDocs>>,
    // pub call: Call,
    pub call: CallHandler,
}

impl AppState {
    pub fn default() -> Self {
        let user = "".to_string();
        let db = None;
        // let call = Call::new();
        let call = CallHandler::new();
        Self { user, db, call }
    }

    // pub fn init_db(&mut self, db: Cliqu3Db) -> Result<()> {
    //     self.db = Some(Arc::new(db));
    //     Ok(())
    // }

    pub fn init_db(&mut self, db: ServerDocs) -> Result<()> {
        self.db = Some(Arc::new(db));
        Ok(())
    }
}
