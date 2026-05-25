// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// mod app_service;
// use crate;
use ::xmtp::{Conversation, Recipient};
use alloy::hex;
use anyhow::{Error, Result};
use rand::RngCore;
use std::path;
use std::sync::Arc;
use tauri::ipc::Response;
use tauri::{Builder, Manager, State};
use tokio::{sync::Mutex, task::Id};
use url::Url;

pub mod app_state;
pub mod cache;
pub mod call;
pub mod config;
pub mod iroh;
pub mod smart_contract;
pub mod temp_signer;
pub mod walletconnect;
pub mod walletconnect_test;
pub mod xmtp;

use crate::xmtp::{Chat, MemberProfile};
use crate::{
    app_state::AppState,
    cache::Message,
    iroh::cliqu3db::{Server, ServerDocs, ServerMetadata},
};

#[tauri::command]
async fn init_state(
    state: State<'_, Mutex<AppState>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    println!("Running init_state");
    // maybe init session instead? think about it
    // init state cannot be ran twice
    // causes state issues on logout and trying to login again
    // println!("running contract update profile");
    // let out = smart_contract::interact::update_profile(Some("MyNewUserName".to_string()), None, None).await;
    // println!("contract update profile output: {:?}", out);
    // println!("running contract get profile");
    // let out = smart_contract::interact::get_profile().await;
    // println!("contract get profile output: {:?}", out);
    let mut app_state = state.lock().await;
    // let path = path::PathBuf::from(config::BASE_FILE_LOCATION);
    // let db = ServerDocs::new(path).await.map_err(|e| format!("couldn't init cliqu3 db: {e}"))?;
    // let _ = app_state.init_db(db);

    if app_state.db.is_none() {
        let _ = app_state.init_db().await.expect("init db failed");
    }

    if app_state.xmtp.is_some() {
        let _ = app_state
            .xmtp
            .as_ref()
            .expect("failed to get xmtp")
            .init_stream(app);
    }

    Ok(())
}

#[tauri::command]
async fn init_db(state: State<'_, Mutex<AppState>>) -> Result<(), String> {
    println!("Running init db");
    let mut app_state = state.lock().await;

    if app_state.db.is_none() {
        let _ = app_state.init_db().await.expect("init db failed");
    }
    Ok(())
}

#[tauri::command]
async fn get_wc_uri(
    state: State<'_, Mutex<AppState>>,
    app: tauri::AppHandle,
) -> Result<String, String> {
    println!("Running get wc uri");
    let mut app_state = state.lock().await;
    // let uri = app_state.init_wallet_connect().await.expect("init wc failed");
    let uri = app_state.create_wc_uri();
    println!("WalletConnect URI: {}", uri);
    Ok(uri)
}

#[tauri::command]
async fn init_wc(
    uri: String,
    state: State<'_, Mutex<AppState>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    println!("Running init WC");
    let mut app_state = state.lock().await;
    // let uri = app_state.init_wallet_connect().await.expect("init wc failed");
    // let uri = app_state.create_wc_uri();
    let wc_init = app_state.init_wallet_connect(uri, app).await;
    println!("End of WC init");
    Ok(())
}

// #[tauri::command]
// async fn init_wc(
//     state: State<'_, Mutex<AppState>>,
//     app: tauri::AppHandle,
// ) -> Result<String, String> {
//     println!("Running init WC");
//     let mut app_state = state.lock().await;
//     let uri = app_state
//         .init_wallet_connect()
//         .await
//         .expect("init wc failed");
//     Ok(uri)
// }

#[tauri::command]
async fn login(
    user: &str,
    pgp_key: &str,
    state: State<'_, Mutex<AppState>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    println!("Running login");
    let mut app_state = state.lock().await;
    let path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data path");
    // app_state.login(user, pgp_key, path).expect("login failed");
    // app_state.init_db().await.map_err(|e| format!("couldn't init db: {e}"))?;
    Ok(())
}

#[tauri::command]
async fn logout(state: State<'_, Mutex<AppState>>, app: tauri::AppHandle) -> Result<(), String> {
    println!("Running logout");
    let mut app_state = state.lock().await;
    let path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data path");
    // app_state.logout(path).expect("logout failed");
    // app_state.init_db().await.map_err(|e| format!("couldn't init db: {e}"))?;
    Ok(())
}

#[tauri::command]
async fn get_session(
    state: State<'_, Mutex<AppState>>,
    app: tauri::AppHandle,
) -> Result<String, String> {
    // Placeholder implementation
    let mut app_state = state.lock().await;
    let address = app_state.check_saved_user().expect("no saved user");
    println!("get session inbox id: {:?}", address);
    // let result = smart_contract::interact::get_profile()
    //     .await
    //     .expect("failed to get profile from smart contract");

    // let result = smart_contract::interact::test_contract()
    //     .await
    //     .expect("failed to test cliqu3 smart contract");
    //

    // let test_avatar = String::from(
    //     // r#"data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="%237F5AF0"/><circle cx="100" cy="85" r="35" fill="%23ffffff" opacity="0.3"/><text x="100" y="150" font-family="monospace" font-size="16" fill="%23ffffff" font-weight="bold" text-anchor="middle">cliqu3_dev</text></svg>"#,
    //     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzUlEQVR4AcXBsWlDMRiF0c8XTeAJPIAgoFbgQew1PIbXyKsyhUGtCqM6ZAJX6Z32fykM4hnuObv71++TYJRKlHtji1EqUe6NSJgJM2G2W74/nkzIvfHKKJUZwkyYCbOUe+Odcm/MEGbCTJil2/VMdLx8Eo1S2SL3RnS7nomEmTATZmm//BANKlHujS1GqUT7hRVhJsyEWWLSKJVXcm/MEGbCTJgl/sm9EY1SmTFKJcq9EY1SiYSZMBNm6XE6sHJhJffGOz1OByJhJsyE2R/3lDA4e9QQhAAAAABJRU5ErkJggg==",
    // );
    // let result = smart_contract::interact::create_profile(
    //     "Cliqu3User".to_string(),
    //     "Test Bio, Nothing Interesting".to_string(),
    //     test_avatar,
    // )
    // .await
    // .expect("failed to create profile for cliqu3 smart contract");

    Ok(address)
}

#[tauri::command]
async fn create_server(
    name: &str,
    pic: &str,
    creator_address: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    println!("Running create_server");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let id = db
        .create_server(name, pic, creator_address)
        .await
        .map_err(|e| format!("could not create server: {e}"))?;

    if app_state.xmtp.is_some() {
        let members: Vec<Recipient> = vec![];
        let new_group_id = app_state
            .xmtp
            .as_ref()
            .expect("failed to get xmtp instance")
            .create_group(&members, Some("general".to_string()), None, None)
            .expect("failed to create new group");
        db.add_text_channel(&id, "general", &new_group_id)
            .await
            .expect("failed to add text channel to server");
    }
    // let out = smart_contract::interact::update_profile(Some("New Username".to_string()), None, None).await;
    Ok(id)
}

#[tauri::command]
async fn create_text_channel(
    id: &str,
    name: &str,
    members: Vec<String>,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    println!("Running create_text_channel");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    if app_state.xmtp.is_some() {
        // let mut new_group_members: Vec<Recipient> = vec![];
        let new_group_members: Vec<Recipient> = members
            .into_iter()
            .map(|member| Recipient::Address(member))
            .collect();
        println!("new group members: {:?}", new_group_members);
        // let members: Vec<Recipient> = vec![];
        let new_group_id = app_state
            .xmtp
            .as_ref()
            .expect("failed to get xmtp instance")
            .create_group(&new_group_members, Some(name.to_string()), None, None)
            .expect("failed to create new group");
        db.add_text_channel(&id, name, &new_group_id)
            .await
            .expect("failed to add text channel to server");

        return Ok(new_group_id);
    } else {
        return Err("Error: create_text_channel failed".to_string());
    }
}

#[tauri::command]
async fn add_text_channel(
    id: &str,
    name: &str,
    text_channel_id: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!("Running add_text_channel");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    db.add_text_channel(id, name, text_channel_id)
        .await
        .map_err(|e| format!("could not create server: {e}"))?;
    Ok(())
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn get_server(id: &str, state: State<'_, Mutex<AppState>>) -> Result<Server, String> {
    println!("Running get_server");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let mut db = db_arc.lock().await;
    let server = db
        .get_server(id)
        .await
        .map_err(|e| format!("could not find server: {e}"))?;
    Ok(server)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn get_all_servers(state: State<'_, Mutex<AppState>>) -> Result<Vec<ServerMetadata>, String> {
    println!("Running get_all_server");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let servers_list = db
        .get_all_servers()
        .await
        .map_err(|e| format!("could not find server: {e}"))?;
    Ok(servers_list)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn update_server(
    id: &str,
    metadata: ServerMetadata,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    println!("Running invite");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let ticket = db
        .update_server_metadata(id, metadata)
        .await
        .map_err(|e| format!("could not find server: {e}"))?;
    Ok(ticket)
}

#[tauri::command]
async fn join_server(ticket: &str, state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    println!("Running join_server");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let server_id = db
        .join_server(ticket)
        .await
        .map_err(|e| format!("could not find server/peer is not online: {e}"))?;
    Ok(server_id)
}

#[tauri::command]
async fn get_conversation(id: &str, state: State<'_, Mutex<AppState>>) -> Result<Chat, String> {
    println!("Running get_conversation");
    let app_state = state.lock().await;
    let chat = app_state
        .xmtp
        .as_ref()
        .expect("failed to get xmtp instance")
        .get_conversation(id)
        .map_err(|e| format!("could not get convo: {e}"))?;
    Ok(chat)
}

#[tauri::command]
async fn send_message(
    id: &str,
    text: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!("Running send_message");
    let app_state = state.lock().await;
    app_state
        .xmtp
        .as_ref()
        .expect("failed to get xmtp instance")
        .send_message(id, text);
    Ok(())
}

#[tauri::command]
async fn get_cliqu3_profile(address: &str) -> Result<MemberProfile, String> {
    println!("Running get_cliqu3_profile for: {:?}", address);
    let result = smart_contract::interact::get_profile(address).await;
    match result {
        Ok(profile) => return Ok(profile),
        Err(e) => {
            eprint!("failed to get cliqu3 profile: {:?}", e);
            return Err("Failed".into());
        }
    }
    // Ok(profile)
}

#[tauri::command]
async fn get_ens_name(address: &str, state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    println!("Running get_ens_name");
    let app_state = state.lock().await;
    let ens_name = app_state
        .xmtp
        .as_ref()
        .expect("failed to get xmtp instance")
        .get_ens_name(address);
    Ok("test".to_string())
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn invite(id: &str, state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    println!("Running invite");
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let ticket = db
        .invite(id)
        .await
        .map_err(|e| format!("could not find server: {e}"))?;
    Ok(ticket)
}

#[tauri::command]
async fn get_user(state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    println!("Running get_user");
    let app_state = state.lock().await;
    println!("User: {:?}", app_state.user);
    let user = app_state.user.clone().unwrap();
    Ok(user)
}

#[tauri::command]
async fn start_call(
    server_id: &str,
    voice_channel_id: &str,
    user: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!("Running start_call");
    let mut app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let endpoint = db
        .add_user_to_call(server_id, voice_channel_id, user)
        .await
        .expect("adding user to voice channel doc failed");
    // let _ = app_state.call.start(endpoint, app).await.expect("call start failed");
    // let call_handler = CallHandler::new();
    // call_handler.start(endpoint).await;
    let _ = app_state.call.start(endpoint).await;
    Ok(())
}

#[tauri::command]
async fn join_call(
    server_id: &str,
    voice_channel_id: &str,
    user: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!("Running join_call");
    let mut app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let _ = db
        .add_user_to_call(server_id, voice_channel_id, user)
        .await
        .expect("adding user to voice channel doc failed");
    let remote_pk_str = db
        .get_caller_id(server_id, voice_channel_id)
        .await
        .expect("getting caller id failed");
    // let _ = app_state.call.join_new(&remote_pk_str).await.expect("call join failed");
    // let mut call_handler = CallHandler::new();
    // call_handler.join(&remote_pk_str).await;
    let _ = app_state.call.join(&remote_pk_str).await;
    Ok(())
}

#[tauri::command]
async fn end_call(
    server_id: &str,
    voice_channel_id: &str,
    user: &str,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!("inside end call");
    // println!("{:?}", server_id.to_string());
    // println!("{:?}", voice_channel_id.to_string());
    // println!("{:?}", user.to_string());
    // println!("Running end_call");
    let app_state = state.lock().await;
    // let _ = app_state.call.leave_call();
    println!("before remove user from call is called");
    // let _ = app_state.call.leave_call().expect("leave call failed");
    // let _ = app_state.call.end().await;
    // let app_state2 = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let db = db_arc.lock().await;
    let _ = db
        .remove_user_from_call(server_id, voice_channel_id, user)
        .await
        .expect("removing user from call doc failed");
    // let _ = app_state.call.leave_call().expect("leave call failed");
    let _ = app_state.call.leave_call();
    Ok(())
}

#[tauri::command]
async fn set_current_server(
    ticket_str: &str,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!(
        "Running set_current_server with ticket str: {:?}",
        ticket_str
    );
    let app_state = state.lock().await;
    let db_arc = app_state
        .db
        .as_ref()
        .expect("Database no initialized")
        .clone();
    let mut db = db_arc.lock().await;
    let _ = db
        .set_current_server(ticket_str, app)
        .await
        .expect("set_current_server failed");
    Ok(())
}

#[tauri::command]
// async fn get_messages_from_cache(chat_id: &str, app: tauri::AppHandle, state: State<'_, Mutex<AppState>>) ->  Result<Vec<Message>, String> {
async fn get_messages_from_cache(
    chat_id: &str,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<Response, String> {
    // let start = std::time::Instant::now();
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let cached_messages = app_state
        .cache
        .get_messages(chat_id)
        .expect("error getting cached messages");
    // println!("get_messages_from_cache: {:?}", cached_messages);
    // println!("Backend took: {:?}", start.elapsed());
    let bytes = serde_json::to_vec(&cached_messages).expect("Failed to serialize");
    // Ok(cached_messages)
    Ok(Response::new(bytes))
}

#[tauri::command]
async fn add_messages_to_cache(
    chat_id: String,
    messages: Vec<Message>,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    // println!("add_messages_to_cache called with chat_id: {}, messages: {:?}", chat_id, messages);
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let insert = app_state.cache.insert_messages(chat_id, messages);
    Ok(())
}

#[tauri::command]
async fn update_message_in_cache(
    chat_id: &str,
    message_cid: &str,
    message: Message,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!(
        "update_messages_in_cache called with chat_id: {}, cid: {:?}",
        chat_id, message_cid
    );
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let update = app_state
        .cache
        .update_message(chat_id, message_cid, message);
    Ok(())
}

#[tauri::command]
async fn update_reaction_in_cache(
    chat_id: &str,
    message_cid: &str,
    reaction: &str,
    user: &str,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    println!(
        "update_reaction_in_cache called with chat_id: {}, reaction: {:?}",
        chat_id, reaction
    );
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let update = app_state
        .cache
        .update_reaction(chat_id, message_cid, reaction, user);
    Ok(())
}

#[tauri::command]
async fn get_cid_from_cache(
    chat_id: &str,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let last_read_cid = app_state
        .cache
        .get_last_read_message_cid(chat_id)
        .expect("error getting cached messages");
    // println!("get_messages_from_cache: {:?}", cached_messages);
    Ok(last_read_cid)
}

#[tauri::command]
async fn add_cid_to_cache(
    chat_id: String,
    message_cid: String,
    app: tauri::AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    // println!("add_messages_to_cache called with chat_id: {}, messages: {:?}", chat_id, messages);
    let app_state = state.lock().await;
    // let cache = app_state.cache;
    let _insert = app_state
        .cache
        .insert_last_read_message_cid(chat_id, message_cid);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            get_user,
            init_state,
            init_db,
            init_wc,
            login,
            get_session,
            get_server,
            get_all_servers,
            create_server,
            update_server,
            join_server,
            get_conversation,
            send_message,
            get_cliqu3_profile,
            get_ens_name,
            invite,
            start_call,
            join_call,
            end_call,
            set_current_server,
            get_wc_uri,
            create_text_channel,
            add_text_channel,
            get_messages_from_cache,
            add_messages_to_cache,
            update_message_in_cache,
            update_reaction_in_cache,
            get_cid_from_cache,
            add_cid_to_cache
        ])
        // .on_window_event(|window, event| match event {
        //     tauri::WindowEvent::CloseRequested { api, .. } => {
        //         // end_call();
        //         println!("closing app");
        // } _ => {} })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_opener::init())
// .invoke_handler(tauri::generate_handler![
//     greet,
//     test,
// ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
