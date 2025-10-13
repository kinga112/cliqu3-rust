// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio;

pub mod app_state;
pub mod iroh;
pub mod call;
use cliqu3_lib;

#[tokio::main]
async fn main() {
    let _ = cliqu3_lib::run().await;
}
