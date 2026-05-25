// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio;

pub mod app_state;
pub mod iroh;
pub mod call;
pub mod cache;
pub mod config;
pub mod xmtp;
pub mod walletconnect;
pub mod temp_signer;
pub mod walletconnect_test;
use cliqu3_lib;

#[tokio::main]
async fn main() {
    let _ = cliqu3_lib::run().await;
}
