// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// mod app_service;
// use crate;
use anyhow::{Result, Error};
use std::sync::{Arc};
use tokio::{sync::Mutex, task::Id};
use tauri::{State, Builder, Manager};
use std::path;

pub mod app_state;
pub mod iroh;
pub mod call;

use crate::{app_state::AppState, iroh::cliqu3db::{Cliqu3Db, Server, ServerDocs, ServerMetadata}};

#[tauri::command]
async fn init_state(state: State<'_, Mutex<AppState>>) ->  Result<(), String>{
    println!("Running init_state");
    let mut app_state = state.lock().await;
    let path = path::PathBuf::from("C:/Users/kinga/Documents/cliqu3/iroh_data");
    // let db = Cliqu3Db::new(path).await.map_err(|e| format!("couldn't init cliqu3 db: {e}"))?;
    let db = ServerDocs::new(path).await.map_err(|e| format!("couldn't init cliqu3 db: {e}"))?;
    let _ = app_state.init_db(db);
    Ok(())
}

#[tauri::command]
async fn create_server(name: &str, pic: &str, creator_address: &str, state: State<'_, Mutex<AppState>>) ->  Result<String, String> {
    println!("Running create_server");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let id = db.create_server(name, pic, creator_address).await.map_err(|e| format!("could not create server: {e}"))?;
    Ok(id)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn get_server(id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String> {
    println!("Running get_server");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let mut db = db_arc.lock().await;
    let server = db.get_server(id).await.map_err(|e| format!("could not find server: {e}"))?;
    Ok(server)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn get_all_servers(state: State<'_, Mutex<AppState>>) ->  Result<Vec<ServerMetadata>, String>{
    println!("Running get_all_server");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let servers_list = db.get_all_servers().await.map_err(|e| format!("could not find server: {e}"))?;
    Ok(servers_list)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn update_server(id: &str, metadata: ServerMetadata, state: State<'_, Mutex<AppState>>) ->  Result<String, String>{
    println!("Running invite");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let ticket = db.update_server_metadata(id, metadata).await.map_err(|e| format!("could not find server: {e}"))?;
    Ok(ticket)
}

#[tauri::command]
async fn join_server(ticket: &str, state: State<'_, Mutex<AppState>>) ->  Result<String, String>{
    println!("Running join_server");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let server_id = db.join_server(ticket).await.map_err(|e| format!("could not find server/peer is not online: {e}"))?;
    Ok(server_id)
}

#[tauri::command]
// async fn get_server(server_id: &str, state: State<'_, Mutex<AppState>>) ->  Result<Server, String>{
async fn invite(id: &str, state: State<'_, Mutex<AppState>>) ->  Result<String, String>{
    println!("Running invite");
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let ticket = db.invite(id).await.map_err(|e| format!("could not find server: {e}"))?;
    Ok(ticket)
}

#[tauri::command]
async fn get_user(state: State<'_, Mutex<AppState>>) ->  Result<String, String> {
    println!("Running get_user");
    let app_state = state.lock().await;
    println!("User: {:?}", app_state.user);
    Ok(app_state.user.clone())
}

#[tauri::command]
async fn start_call(server_id: &str, voice_channel_id: &str, user: &str, app: tauri::AppHandle, state: State<'_, Mutex<AppState>>) ->  Result<(), String> {
    println!("Running start_call");
    let mut app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let endpoint = db.add_user_to_call(server_id, voice_channel_id, user).await.expect("adding user to voice channel doc failed");
    // let _ = app_state.call.start(endpoint, app).await.expect("call start failed");
    // let call_handler = CallHandler::new();
    // call_handler.start(endpoint).await;
    let _ = app_state.call.start(endpoint).await;
    Ok(())
}

#[tauri::command]
async fn join_call(server_id: &str, voice_channel_id: &str, user: &str, state: State<'_, Mutex<AppState>>) ->  Result<(), String> {
    println!("Running join_call");
    let mut app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let _ = db.add_user_to_call(server_id, voice_channel_id, user).await.expect("adding user to voice channel doc failed");
    let remote_pk_str = db.get_caller_id(server_id, voice_channel_id).await.expect("getting caller id failed");
    // let _ = app_state.call.join_new(&remote_pk_str).await.expect("call join failed");
    // let mut call_handler = CallHandler::new();
    // call_handler.join(&remote_pk_str).await;
    let _ = app_state.call.join(&remote_pk_str).await;
    Ok(())
}

#[tauri::command]
async fn end_call(server_id: &str, voice_channel_id: &str, user: &str, state: State<'_, Mutex<AppState>>) ->  Result<(), String> {
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
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let _ = db.remove_user_from_call(server_id, voice_channel_id, user).await.expect("removing user from call doc failed");
    // let _ = app_state.call.leave_call().expect("leave call failed");
    let _ = app_state.call.leave_call();
    Ok(())
}

#[tauri::command]
async fn set_current_server(ticket_str: &str, app: tauri::AppHandle, state: State<'_, Mutex<AppState>>) ->  Result<(), String> {
    println!("Running set_current_server with ticket str: {:?}", ticket_str);
    let app_state = state.lock().await;
    let db_arc = app_state.db.as_ref().expect("Database no initialized").clone();
    let db = db_arc.lock().await;
    let _ = db.set_current_server(ticket_str, app).await.expect("set_current_server failed");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run(){
    tauri::Builder::default()
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
             get_user,
             init_state,
             get_server,
             get_all_servers,
             create_server,
             update_server,
             join_server,
             invite,
             start_call,
             join_call,
             end_call,
             set_current_server
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
