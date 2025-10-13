// use std::arch::x86_64;
// use std::collections::VecDeque;
// // use std::sync::mpsc::Receiver;
// use std::time::Duration;
// use std::sync::{Arc, Mutex};

// use anyhow::{Error, Result};
// use iroh_roq::rtp::{header::Header, packet::Packet};
// use iroh_roq::{SendFlow, ReceiveFlow};
// use rtp_rs::RtpPacketBuilder;
// use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
// use cpal::{Device, Stream};
// use iroh_roq::{rtp::codecs::opus::OpusPacket, Session, VarInt, ALPN};
// use iroh::{Endpoint, NodeAddr, PublicKey};
// use tauri::Emitter;
// use std::sync::atomic::{AtomicU16, AtomicU32, Ordering};
// use bytes::Bytes;
// use opus::{Encoder, Decoder, Application, Channels};

// use crate::iroh::cliqu3db::ServerDocs;
// use crate::iroh::streams;

// use tokio::sync::{broadcast, oneshot};
// use tokio::signal;
// use tokio::sync::mpsc;
// use tokio::sync::mpsc::{Sender, Receiver};
// use tokio_util::sync::CancellationToken;
// // use lazy_static::lazy_static;
// // use std::sync::mpsc;

// // const MONO_20MS: usize = 48000 * 20 / 1000;
// const SAMPLE_RATE: u32 = 48_000;
// // const CHANNELS: usize = 2;
// const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

// // lazy_static! {
// //     static ref INPUT_STREAM_HANDLE: Mutex<Option<Stream>> = Mutex::new(None);
// // }

// // lazy_static! {
// //     static ref OUTPUT_STREAM_HANDLE: Mutex<Option<Stream>> = Mutex::new(None);
// // }

// // #[derive(Clone)]
// pub struct CallOld {
//     active_users: String,
//     video: bool,
//     audio: bool,
//     audio_device: Option<Device>,
//     silence: bool,
//     // current_call_endpoint: Option<Endpoint>,
//     // input_stream: Mutex<Option<Stream>>,
//     // output_stream: Mutex<Option<Stream>>,
//     // current_call: Option<CurrentCall>,
//     token: Option<CancellationToken>,
//     // token: CancellationToken,

// }

// #[derive(Clone)]
// pub struct CurrentCall {
//     server_id: String,
//     voice_channel_id: String,
//     token: CancellationToken,
// }

// impl CallOld {
//     // pub async fn new() -> Result<()>{
//     pub fn new() -> Self{
//         println!("call::new");
//         // let token = CancellationToken::new();
//         Self { active_users: "user 1".to_string(), video: true, audio: true, audio_device: None, silence: false, token: None }
//     }

//     pub async fn test(&self) -> Result<()>{
//         let host = cpal::default_host();

//         // Input device (mic)
//         let input_device = host.default_input_device().expect("No input device available");
//         let input_config = input_device.default_input_config()?;

//         // Output device (speakers/headphones)
//         let output_device = host.default_output_device().expect("No output device available");
//         let output_config = output_device.default_output_config()?;

//         println!("Input format: {:?}", input_config);
//         println!("Output format: {:?}", output_config);

//         let sample_format = input_config.sample_format();
//         let input_config = input_config.into();
//         let output_config = output_config.into();

//         // Shared buffer between input & output
//         let buffer = std::sync::Arc::new(std::sync::Mutex::new(Vec::<f32>::new()));
//         let buffer_in = buffer.clone();
//         let buffer_out = buffer.clone();

//         // Build input stream (mic -> buffer)
//         let input_stream = input_device.build_input_stream(
//             &input_config,
//             move |data: &[f32], _: &cpal::InputCallbackInfo| {
//                 let mut buf = buffer_in.lock().unwrap();
//                 buf.extend_from_slice(data);
//             },
//             move |err| eprintln!("input stream error: {}", err),
//             None,
//         )?;

//         // Build output stream (buffer -> speakers)
//         let output_stream = output_device.build_output_stream(
//             &output_config,
//             move |output: &mut [f32], _: &cpal::OutputCallbackInfo| {
//                 let mut buf = buffer_out.lock().unwrap();
//                 for (out, sample) in output.iter_mut().zip(buf.drain(..)) {
//                     *out = sample;
//                 }
//             },
//             move |err| eprintln!("output stream error: {}", err),
//             None,
//         )?;

//         input_stream.play()?;
//         output_stream.play()?;

//         println!("Speak into the mic, you should hear yourself...");
//         std::thread::sleep(std::time::Duration::from_secs(10));
//         Ok(())
//     }

//     pub async fn start(&self, endpoint: Endpoint, app: tauri::AppHandle) -> Result<()>{
//         println!("inside start test call");
//         // self.current_call_endpoint = Some(endpoint.clone());
//         // let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await?;
//         println!("endpoint pk: {:?}", endpoint.node_id().to_string());
//         let host = cpal::default_host();

//         // Input device (mic)
//         let input_device = host.default_input_device().expect("No input device available");
//         // let stream_config = cpal::StreamConfig {
//         //     channels: 1,
//         //     sample_rate: cpal::SampleRate(48000),
//         //     buffer_size: cpal::BufferSize::Default,
//         // };
        
//         let input_config = input_device.default_input_config()?.config();
//         let input_channels = input_config.channels as usize;
//         println!("input config default: {:?}", input_config.channels);
//         println!("input config default: {:?}", input_config.sample_rate);
//         // Output device (speakers/headphones)
//         // let output_device = host.default_output_device().expect("No output device available");
//         // for config_range in output_device.supported_output_configs().unwrap() {
//         //     println!(
//         //         "min {:?}, max {:?}, channels {:?}, sample format {:?}",
//         //         config_range.min_sample_rate(),
//         //         config_range.max_sample_rate(),
//         //         config_range.channels(),
//         //         config_range.sample_format()
//         //     );
//         // }
//         // let output_config = output_device.default_input_config()?.config();
//         // let output_config = cpal::StreamConfig {
//         //     channels: 2, // must be stereo
//         //     sample_rate: cpal::SampleRate(48_000), // your device only supports 48kHz
//         //     buffer_size: cpal::BufferSize::Default,
//         // };


//         let ssrc: u32 = 42;
//         let seq = Arc::new(AtomicU16::new(0));
//         let ts = Arc::new(AtomicU32::new(0));

//         // Shared playback buffer for decoded samples
//         let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));
//         // let playback_buffer = Arc::new(Mutex::new(Vec::<i16>::new()));

//         // Build the output stream ONCE
//         let playback_buffer_clone = playback_buffer.clone();

//         // let mut buf = playback_buffer_clone.lock().unwrap();
//         // for i in 0..4800 {
//         //     let sample = ((i as f32 * 440.0 * 2.0 * std::f32::consts::PI / 48000.0).sin() * 30000.0) as i16;
//         //     buf.push_back(sample); // left
//         //     buf.push_back(sample); // right
//         // }

//         // let output_stream = output_device.build_output_stream(
//         //     &output_config,
//         //     move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
//         //         let mut buf = playback_buffer_clone.lock().unwrap();
//         //         // for sample in data.iter_mut() {
//         //         //     *sample = buf.pop_front().unwrap_or(0);
//         //         // }

//         //         // for chunk in data.chunks_mut(2) {
//         //         //     let sample = buf.pop_front().unwrap_or(0);
//         //         //     println!("Buffer length: {}", buf.len());
//         //         //     chunk[0] = sample; // left
//         //         //     chunk[1] = sample; // right
//         //         // }

//         //         for (out, sample) in data.iter_mut().zip(buf.drain(..)) {
//         //             *out = sample;
//         //         }

//         //     },
//         //     move |err| eprintln!("output stream error: {}", err),
//         //     None,
//         // ).expect("output stream failed");

//         // output_stream.play().expect("output stream play failed");

//         let app_handle = app.clone();

//         let mut tmp_stream: Option<Stream> = None;

//         // let (tx, mut rx) = mpsc::channel(100);

//         // self.testing_input_device_task(tx).await;

//         // println!("after starting input device task??");

//         let _handle = tokio::task::spawn(async move {
//             while let Some(incoming) = endpoint.accept().await {
//                 if let Ok(connection) = incoming.await {
//                     println!("CONN Start: {:?}", connection.clone().alpn());
//                     assert_eq!(connection.clone().alpn().unwrap(), ALPN, "invalid ALPN");
//                     let session = Session::new(connection.clone());
//                     let flow_id = VarInt::from_u32(0);
//                     let send_flow = session.new_send_flow(flow_id).await.unwrap();
//                     let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//                     // loop {
//                     //     match rx.try_recv() {
//                     //         Ok(packet) => {
//                     //             println!("sending packet!");
//                     //             // info!("sending packet!");
//                     //             let a = send_flow.send_rtp(&packet);
//                     //         }
//                     //         Err(mpsc::error::TryRecvError::Empty) => break,
//                     //         Err(mpsc::error::TryRecvError::Disconnected) => {
//                     //             // info!("stop playback mixer loop: channel closed");
//                     //             println!("stop playback mixer loop: channel closed");
//                     //             return;
//                     //         }
//                     //     }
//                     // }
//                     // loop {
//                     //     match rx.try_recv() {
//                     //         Ok(packet) => {
//                     //             println!("sending packet!");
//                     //             if let Err(e) = send_flow.send_rtp(&packet) {
//                     //                 eprintln!("Failed to send RTP: {:?}", e);
//                     //             }
//                     //         }
//                     //         Err(mpsc::error::TryRecvError::Empty) => break,
//                     //         Err(mpsc::error::TryRecvError::Disconnected) => {
//                     //             println!("channel closed!!");
//                     //             return;
//                     //         }
//                     //     }
//                     // }

//                     // while let Some(packet) = rx.recv().await {
//                     //     println!("Got packet of size");
//                     //     if let Err(e) = send_flow.send_rtp(&packet) {
//                     //         eprintln!("Failed to send RTP: {:?}", e);
//                     //     }
//                     // }


//                     // println!("RTP send task started");
//                     // while let Some(packet) = rx.recv().await {
//                     //     println!("Got packet of size");
//                     //     if let Err(e) = send_flow.send_rtp(&packet) {
//                     //         eprintln!("Failed to send RTP: {:?}", e);
//                     //     }
//                     // }
//                     // println!("RTP send task ended");
//                     let seq = seq.clone();
//                     let ts = ts.clone();

//                     let mut opus_encoder_channels = Channels::Mono;
//                     if input_channels == 2 {
//                         opus_encoder_channels = Channels::Stereo;
//                     }

//                     let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//                     let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();

//                     // let frame_size = 960; // 20ms @ 48kHz stereo
//                     // let mut sample_buffer = Vec::with_capacity(frame_size * 2);
//                     // let mut pcm_out = vec![0i16; frame_size * 2];
//                     let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

//                     // Input stream for mic capture
//                     let input_stream = input_device.build_input_stream(
//                         &input_config,
//                         move |data: &[i16], _: &cpal::InputCallbackInfo| {
//                             for &sample in data {
//                                 sample_buffer.push(sample);
//                                 if sample_buffer.len() >= FRAME_SIZE * input_channels {
//                                     let mut out = [0u8; 4000];
//                                     if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//                                         let packet = Packet {
//                                             header: Header {
//                                                 sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                                                 timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//                                                 ssrc,
//                                                 payload_type: 97,
//                                                 ..Default::default()
//                                             },
//                                             payload: Bytes::from(out[..len].to_vec()),
//                                         };
//                                         if let Err(e) = send_flow.send_rtp(&packet) {
//                                             // input from user in call is still streamed but fails to send
//                                             // since no other users in call
//                                             eprintln!("Send RTP error 123: {:?}", e);
//                                             println!("sample after conn lost error: {:?}", sample);
//                                             let error_code: VarInt = VarInt::from_u32(100);
//                                             let reason: &[u8] = b"connection ended / all users left the call";
//                                             connection.close(error_code, reason);
//                                             panic!("Input stream error: conn lost");
//                                         }
//                                     }
//                                     sample_buffer.clear();
//                                 }
//                             }
//                         },
//                         move |err| eprintln!("input stream error: {}", err),
//                         None,
//                     ).unwrap();
//                     input_stream.play().unwrap();
                    
//                     // *INPUT_STREAM_HANDLE.lock().unwrap() = Some(input_stream);
//                     // INPUT_STREAM_HANDLE.lock().unwrap().as_ref().unwrap().play().unwrap();
//                     // tmp_stream = Some(input_stream);
//                     // *self.input_stream.lock().unwrap() = Some(input_stream);
                    

//                     let mut pcm_out = vec![0i16; FRAME_SIZE * 2]; // 2 for stereo for output

//                     // Receive RTP loop
//                     while let Ok(packet) = recv_flow.read_rtp().await {
//                         if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//                             // let bytes: Vec<u8> = pcm_out[..decoded]
//                             //     .iter()
//                             //     .flat_map(|s| s.to_le_bytes()) // i16 → 2 bytes
//                             //     .collect();

//                             // let _ = app_handle.emit("audio_event", bytes).expect("failed to emit audio events");

//                             let mut buf = playback_buffer.lock().unwrap();
//                             buf.extend(&pcm_out[..decoded]);
//                         }
//                     }
//                     println!("Testing print after incoming accept if");
//                 }
//                 println!("AFTER RTP SEND ERROR");
//             }
//             println!("after while loop");
//         });
        
//         // TESTING CANCEL AND MULTIPLE TASKS TO HANDLE CALL FOR AUDIO SEND/RECV
//         // let _handle2 = tokio::task::spawn(async move {
//         //     let seq = seq.clone();
//         //     let ts = ts.clone();

//         //     let mut opus_encoder_channels = Channels::Mono;
//         //     if input_channels == 2 {
//         //         opus_encoder_channels = Channels::Stereo;
//         //     }

//         //     let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//         //     let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();

//         //     // let frame_size = 960; // 20ms @ 48kHz stereo
//         //     // let mut sample_buffer = Vec::with_capacity(frame_size * 2);
//         //     // let mut pcm_out = vec![0i16; frame_size * 2];
//         //     let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

//         //     let tx_clone = tx.clone();

//         //     println!("before input stream init");

//         //     // Input stream for mic capture
//         //     let input_stream = input_device.build_input_stream(
//         //         &input_config,
//         //         move |data: &[i16], _: &cpal::InputCallbackInfo| {
//         //             println!("Audio callback fired, {} samples", data.len());
//         //             for &sample in data {
//         //                 sample_buffer.push(sample);
//         //                 if sample_buffer.len() >= FRAME_SIZE * input_channels {
//         //                     let mut out = [0u8; 4000];
//         //                     if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//         //                         let packet = Packet {
//         //                             header: Header {
//         //                                 sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//         //                                 timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//         //                                 ssrc,
//         //                                 payload_type: 97,
//         //                                 ..Default::default()
//         //                             },
//         //                             payload: Bytes::from(out[..len].to_vec()),
//         //                         };
//         //                         println!("sending packet to rx");
//         //                         // let a = tx.send(packet).expect("failed to transmitt packet");
//         //                         if tx_clone.try_send(packet).is_err() {
//         //                             // channel full, drop packet
//         //                             eprintln!("Packet dropped");
//         //                         }
//         //                         // if let Err(e) = send_flow.send_rtp(&packet) {
//         //                         //     // input from user in call is still streamed but fails to send
//         //                         //     // since no other users in call
//         //                         //     eprintln!("Send RTP error 123: {:?}", e);
//         //                         //     println!("sample after conn lost error: {:?}", sample);
//         //                         //     let error_code: VarInt = VarInt::from_u32(100);
//         //                         //     let reason: &[u8] = b"connection ended / all users left the call";
//         //                         //     connection.close(error_code, reason);
//         //                         //     panic!("Input stream error: conn lost");
//         //                         // }
//         //                     }
//         //                     sample_buffer.clear();
//         //                 }
//         //             }
//         //         },
//         //         move |err| eprintln!("input stream error: {}", err),
//         //         None,
//         //     ).unwrap();
//         //     input_stream.play().unwrap();
//         //     println!("Input stream started");
//         // });

//         // *self.input_stream.lock().unwrap() = Some(tmp_stream.unwrap());

//         Ok(())

//     }


//     pub async fn join(&self, remote_pk_str: &str) -> Result<()>{
//         println!("inside join test call");
//         let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await?;
//         // self.current_call_endpoint = Some(endpoint.clone());
//         println!("remote pk: {:?}", remote_pk_str);
//         let remote_pk: PublicKey = remote_pk_str.to_string().parse().expect("invalid public string");
//         let remote_node = NodeAddr::new(remote_pk);
//         println!("remote node: {:?}", remote_node.node_id.to_string());

//         let host = cpal::default_host();

//         // Input device (mic)
//         // let input_device = host.default_input_device().expect("No input device available");
//         // let input_config = input_device.default_input_config()?.config();

//         // Output device (speakers/headphones)
//         let output_device = host.default_output_device().expect("No output device available");
//         let default_output_config = output_device.default_output_config()?.config();
//         println!("output config default: {:?}", default_output_config.channels);
//         println!("output config default: {:?}", default_output_config.sample_rate);
//         let output_config = cpal::StreamConfig {
//             channels: 2, // must be stereo
//             sample_rate: cpal::SampleRate(48_000), // your device only supports 48kHz
//             buffer_size: cpal::BufferSize::Default,
//         };

//         let output_channels = output_config.channels as usize;


//         let ssrc: u32 = 42;
//         let seq = Arc::new(AtomicU16::new(0));
//         let ts = Arc::new(AtomicU32::new(0));

//         // Shared playback buffer for decoded samples
//         let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));

//         // Build the output stream ONCE
//         let playback_buffer_clone = playback_buffer.clone();

//         let mut t = 0f32;
//         let freq = 440.0;

//         // maybe a tone to tell that user joins / disconnects - testing with something
//         {
//             let mut buf = playback_buffer.lock().unwrap();
//             for i in 0..4800 {
//                 let sample = ((i as f32 * 440.0 * 2.0 * std::f32::consts::PI / 48000.0).sin() * 30000.0) as i16;
//                 buf.push_back(sample); // left
//                 buf.push_back(sample); // right
//             }
//         }

//         // let (tx, rx) = mpsc::channel();

//         let output_stream = output_device.build_output_stream(
//             &output_config,
//             move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
//                 let mut buf = playback_buffer_clone.lock().unwrap();
//                 let len = data.len().min(buf.len());

//                 // drain exactly that many samples
//                 for (out, sample) in data.iter_mut().zip(buf.drain(..len)) {
//                     *out = sample;
//                 }

//                 // fill any remaining output with silence if buffer underflowed
//                 for out in data[len..].iter_mut() {
//                     *out = 0;
//                 }
//             },
//             move |err| eprintln!("output stream error: {}", err),
//             None,
//         ).expect("output stream failed");

//         // *OUTPUT_STREAM_HANDLE.lock().unwrap() = Some(output_stream);
//         // OUTPUT_STREAM_HANDLE.lock().unwrap().as_ref().unwrap().play().unwrap();

//         output_stream.play().expect("output stream play failed");
//         // let output_stream = Arc::new(output_stream);
//         // let _stream_handle = output_stream.clone();
//         // tokio::time::sleep(std::time::Duration::from_secs(5)).await;

//         // Spawn task for networking
//         let _handle = tokio::task::spawn(async move {
//             if let Ok(connection) = endpoint.connect(remote_node, ALPN).await {
//                 assert_eq!(connection.alpn().unwrap(), ALPN, "invalid ALPN");
//                 println!("CONN Join: {:?}", connection.alpn());
//                 let session = Session::new(connection);
//                 let flow_id = VarInt::from_u32(0);
//                 let send_flow = session.new_send_flow(flow_id).await.unwrap();
//                 let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//                 let seq = seq.clone();
//                 let ts = ts.clone();

//                 // let mut opus_encoder_channels = Channels::Mono;
//                 // if input_channels == 2 {
//                 //     opus_encoder_channels = Channels::Stereo;
//                 // }

//                 let mut encoder = Encoder::new(SAMPLE_RATE, Channels::Mono, Application::Voip).unwrap();
//                 let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();

//                 let frame_size = 960; // 20ms @ 48kHz stereo
//                 // let mut sample_buffer = Vec::with_capacity(frame_size * 2);
//                 let mut pcm_out = vec![0i16; frame_size * 2];

//                 // Input stream for mic capture
//                 // let input_stream = input_device.build_input_stream(
//                 //     &input_config,
//                 //     move |data: &[i16], _: &cpal::InputCallbackInfo| {
//                 //         for &sample in data {
//                 //             sample_buffer.push(sample);
//                 //             if sample_buffer.len() >= frame_size {
//                 //                 let mut out = [0u8; 4000];
//                 //                 if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//                 //                     let packet = Packet {
//                 //                         header: Header {
//                 //                             sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                 //                             timestamp: ts.fetch_add(frame_size as u32, Ordering::Relaxed),
//                 //                             ssrc,
//                 //                             payload_type: 97,
//                 //                             ..Default::default()
//                 //                         },
//                 //                         payload: Bytes::from(out[..len].to_vec()),
//                 //                     };
//                 //                     if let Err(e) = send_flow.send_rtp(&packet) {
//                 //                         eprintln!("Send RTP error: {:?}", e);
//                 //                     }
//                 //                 }
//                 //                 sample_buffer.clear();
//                 //             }
//                 //         }
//                 //     },
//                 //     move |err| eprintln!("input stream error: {}", err),
//                 //     None,
//                 // ).unwrap();

//                 // input_stream.play().expect("input stream play failed");

//                 // Receive RTP loop
//                 while let Ok(packet) = recv_flow.read_rtp().await {
//                     if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//                         let mut buf = playback_buffer.lock().unwrap();
                        
//                         let decoded_channels = output_channels.clone(); // what Opus gave us
//                         let samples_per_channel = decoded; // "decoded" is per channel
//                         let gain = 1.0;

//                         // println!("decoded_channels = {}, samples_per_channel = {}", decoded_channels, samples_per_channel);

//                         for i in 0..samples_per_channel {
//                             if decoded_channels == 1 && output_channels == 2 {
//                                 let s = pcm_out[i];
//                                 buf.push_back(s); // left
//                                 buf.push_back(s); // right
//                             } else {
//                                 // other cases: channels match
//                                 for ch in 0..output_channels {
//                                     let s = pcm_out[i * decoded_channels + ch];
//                                     buf.push_back(s);
//                                 }
//                             }
//                         }

//                         // for &s in &pcm_out[..samples] {
//                         //     let sample = (s as f32 * gain)
//                         //         .clamp(i16::MIN as f32, i16::MAX as f32) as i16;
//                         //     buf.push_back(sample);
//                         // }
//                     }

//                 }
//             }
//         });

//         _handle.await?;

//         Ok(())
//     }

//     pub async fn end(&mut self) -> Result<()> {
//         // let e: Endpoint = endpoint.parse();
//         // if let Some(endpoint) = self.current_call_endpoint.take() {
//         //     // endpoint.close().await;
//         //     if !endpoint.is_closed() {
//         //         // drop(endpoint.clone());
//         //         endpoint.close().await;
//         //     }
//         // }
//         // self.current_call_endpoint.as_ref().expect("call could not close").close().await;
//         Ok(())
//     }

//     pub async fn start_new(&self) -> Result<()>{
//         println!("inside start test call");
//         let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await?;
//         println!("endpoint pk: {:?}", endpoint.node_id().to_string());
//         // let host = cpal::default_host();

//         // Input device (mic)
//         // let input_device = host.default_input_device().expect("No input device available");
//         // let stream_config = cpal::StreamConfig {
//         //     channels: 1,
//         //     sample_rate: cpal::SampleRate(48000),
//         //     buffer_size: cpal::BufferSize::Default,
//         // };
        
//         // let input_config = input_device.default_input_config()?.config();
//         // let input_channels = input_config.channels as usize;
//         // println!("input config default: {:?}", input_config.channels);
//         // println!("input config default: {:?}", input_config.sample_rate);

//         // let ssrc: u32 = 42;
//         // let seq = Arc::new(AtomicU16::new(0));
//         // let ts = Arc::new(AtomicU32::new(0));

//         // Shared playback buffer for decoded samples
//         // let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));
//         // let playback_buffer = Arc::new(Mutex::new(Vec::<i16>::new()));

//         // Build the output stream ONCE
//         // let playback_buffer_clone = playback_buffer.clone();

//         // Spawn task for networking
//         let _handle = tokio::task::spawn(async move {
//             while let Some(incoming) = endpoint.accept().await {
//                 if let Ok(connection) = incoming.await {
//                     println!("CONN Start: {:?}", connection.alpn());
//                     assert_eq!(connection.alpn().unwrap(), ALPN, "invalid ALPN");
//                     let session = Session::new(connection);
//                     let flow_id = VarInt::from_u32(0);
//                     let send_flow = session.new_send_flow(flow_id).await.unwrap();
//                     // let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//                     // let input_stream = self.init_input_stream(send_flow).unwrap();
//                     let input_stream = streams::init_input_stream(send_flow).unwrap();
                    
//                     input_stream.play().unwrap();

//                     // let mut pcm_out = vec![0i16; FRAME_SIZE * 2]; // 2 for stereo for output

//                     // Receive RTP loop
//                     // while let Ok(packet) = recv_flow.read_rtp().await {
//                     //     if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//                     //         let mut buf = playback_buffer.lock().unwrap();
//                     //         buf.extend(&pcm_out[..decoded]);
//                     //     }
//                     // }
//                 }
//             }
//         });

//         Ok(())

//     }

//     pub async fn join_new(&mut self, remote_pk_str: &str) -> Result<()>{
//         println!("inside join test call");
//         let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await?;
//         // self.current_call_endpoint = Some(endpoint.clone());
//         println!("remote pk: {:?}", remote_pk_str);
//         let remote_pk: PublicKey = remote_pk_str.to_string().parse().expect("invalid public string");
//         let remote_node = NodeAddr::new(remote_pk);
//         println!("remote node: {:?}", remote_node.node_id.to_string());

//         // Shared playback buffer for decoded samples
//         let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));

//         // Build the output stream ONCE
//         let playback_buffer_clone = playback_buffer.clone();
//         // let playback_buffer_recv_clone = playback_buffer.clone();
        
//         let (output_stream, output_channels) = self.init_output_stream(playback_buffer_clone).await?;
//         output_stream.play().expect("output stream play failed");
//         let output_stream = Arc::new(output_stream);
//         let _stream_handle = output_stream.clone();

//         // let token = self.current_call.clone().unwrap().token;
//         // let token = CancellationToken::new();
//         // self.token = Some(token);
//         let token = CancellationToken::new();
//         let cloned_token = token.clone();
//         self.token = Some(token);

//         // let (tx, rx) = mpsc::channel();

//         // Spawn task for networking
//         let _handle = tokio::task::spawn(async move {
//             // build session + flow here
//             if let Ok(connection) = endpoint.connect(remote_node, ALPN).await {
//                 assert_eq!(connection.alpn().unwrap(), ALPN, "invalid ALPN");
//                 println!("CONN Join: {:?}", connection.clone().alpn());

//                 let session = Session::new(connection.clone());
//                 let flow_id = VarInt::from_u32(0);
//                 let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//                 let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
//                 let mut pcm_out = vec![0i16; FRAME_SIZE * 2];

//                 loop {
//                     tokio::select! {
//                         _ = cloned_token.cancelled() => {
//                             println!("Call cancelled, shutting down audio task");
//                             recv_flow.close();
//                             let error_code: VarInt = VarInt::from_u32(100);
//                             let reason: &[u8] = b"connection ended / all users left the call";
//                             connection.close(error_code, reason);
//                             break;
//                         }
//                         pkt = recv_flow.read_rtp() => {
//                             match pkt {
//                                 Ok(packet) => {
//                                     if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//                                         let mut buf = playback_buffer.lock().unwrap();
                                        
//                                         let decoded_channels = output_channels.clone();
//                                         let samples_per_channel = decoded;
//                                         let gain = 1.0; // optional volume scaling

//                                         for i in 0..samples_per_channel {
//                                             if decoded_channels == 1 && output_channels == 2 {
//                                                 let s = pcm_out[i];
//                                                 buf.push_back(s); // left
//                                                 buf.push_back(s); // right
//                                             } else {
//                                                 for ch in 0..output_channels {
//                                                     let s = pcm_out[i * decoded_channels + ch];
//                                                     buf.push_back(s);
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                                 Err(e) => {
//                                     eprintln!("recv_flow error: {e:?}");
//                                     break;
//                                 }
//                             }
//                         }
//                     }
//                     // tokio::task::yield_now().await;
//                 }
//             }
//         });

//         _handle.await;

//         Ok(())
//     }


//     // if let Ok(connection) = endpoint.connect(remote_node, ALPN).await {
//     //                     assert_eq!(connection.alpn().unwrap(), ALPN, "invalid ALPN");
//     //                     println!("CONN Join: {:?}", connection.alpn());
//     //                     let session = Session::new(connection);
//     //                     let flow_id = VarInt::from_u32(0);
//     //                     // let send_flow = session.new_send_flow(flow_id).await.unwrap();
//     //                     let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//     //                     // start receiving packets to send to output device through playback buffer
//     //                     // let _ = Self::init_recv_flow(session.clone(), playback_buffer.clone(), output_channels.clone());
//     //                     // let mut buf = playback_buffer.lock().unwrap();
//     //                     // while let Ok(packet) = recv_flow.read_rtp().await {
//     //                     //     let _ = Self::decode_packet(packet, Arc::clone(&playback_buffer), output_channels);
//     //                     // }

//     //                     let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
//     //                     let mut pcm_out = vec![0i16; FRAME_SIZE * 2];

//     //                     while let Ok(packet) = recv_flow.read_rtp().await {
//     //                         if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//     //                             let mut buf = playback_buffer.lock().unwrap();
                                
//     //                             let decoded_channels = output_channels.clone(); // what Opus gave us
//     //                             let samples_per_channel = decoded; // "decoded" is per channel
//     //                             let gain = 1.0;

//     //                             // println!("decoded_channels = {}, samples_per_channel = {}", decoded_channels, samples_per_channel);
//     //                             for i in 0..samples_per_channel {
//     //                                 if decoded_channels == 1 && output_channels == 2 {
//     //                                     let s = pcm_out[i];
//     //                                     buf.push_back(s); // left
//     //                                     buf.push_back(s); // right
//     //                                 } else {
//     //                                     // other cases: channels match
//     //                                     for ch in 0..output_channels {
//     //                                         let s = pcm_out[i * decoded_channels + ch];
//     //                                         buf.push_back(s);
//     //                                     }
//     //                                 }
//     //                             }
//     //                         }
//     //                     }

//     //                 }

//     pub fn leave_call(&self) -> Result<()> {
//         println!("leaving call");
//         let token = self.token.clone().unwrap();
//         token.cancel();
//         println!("canceled task for audio call!");
//         Ok(())
//     }

//     pub async fn init_send_flow(&self, session: Session) -> Result<Stream> {
//         // set session flow
//         let flow_id = VarInt::from_u32(0);
//         let send_flow = session.new_send_flow(flow_id).await.unwrap();

//         // get and set up input device and config
//         let host = cpal::default_host();
//         let input_device = host.default_input_device().expect("No input device available");
//         let input_config = input_device.default_input_config()?.config();
//         let input_channels = input_config.channels as usize;
//         println!("input config default: {:?}", input_config.channels);
//         println!("input config default: {:?}", input_config.sample_rate);

//         // depending on input device channels, choose Mono or Stereo
//         let mut opus_encoder_channels = Channels::Mono;
//         if input_channels == 2 {
//             opus_encoder_channels = Channels::Stereo;
//         }

//         let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//         let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

//         // used to create header
//         let ssrc: u32 = 42;
//         let seq = Arc::new(AtomicU16::new(0));
//         let ts = Arc::new(AtomicU32::new(0));

//         let input_stream = input_device.build_input_stream(
//             &input_config,
//             move |data: &[i16], _: &cpal::InputCallbackInfo| {
//                 for &sample in data {
//                     sample_buffer.push(sample);
//                     if sample_buffer.len() >= FRAME_SIZE * input_channels {
//                         let mut out = [0u8; 4000];
//                         if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//                             let packet = Packet {
//                                 header: Header {
//                                     sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                                     timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//                                     ssrc,
//                                     payload_type: 97,
//                                     ..Default::default()
//                                 },
//                                 payload: Bytes::from(out[..len].to_vec()),
//                             };
//                             if let Err(e) = send_flow.send_rtp(&packet) {
//                                 eprintln!("Send RTP error: {:?}", e);
//                             }
//                         }
//                         sample_buffer.clear();
//                     }
//                 }
//             },
//             move |err| eprintln!("input stream error: {}", err),
//             None,
//         ).unwrap();

//         Ok(input_stream)
//     }

//     pub async fn init_recv_flow(session: Session, playback_buffer: Arc<Mutex<VecDeque<i16>>>, output_channels: usize) -> Result<()> {
//         let flow_id = VarInt::from_u32(0);
//         let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//         let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
//         let mut pcm_out = vec![0i16; FRAME_SIZE * 2];

//         while let Ok(packet) = recv_flow.read_rtp().await {
//             if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//                 let mut buf = playback_buffer.lock().unwrap();
                
//                 let decoded_channels = output_channels.clone(); // what Opus gave us
//                 let samples_per_channel = decoded; // "decoded" is per channel
//                 let gain = 1.0;

//                 // println!("decoded_channels = {}, samples_per_channel = {}", decoded_channels, samples_per_channel);

//                 for i in 0..samples_per_channel {
//                     if decoded_channels == 1 && output_channels == 2 {
//                         let s = pcm_out[i];
//                         buf.push_back(s); // left
//                         buf.push_back(s); // right
//                     } else {
//                         // other cases: channels match
//                         for ch in 0..output_channels {
//                             let s = pcm_out[i * decoded_channels + ch];
//                             buf.push_back(s);
//                         }
//                     }
//                 }
//             }

//         }

//         Ok(())

//     }

//     pub fn init_input_stream(&self, send_flow: SendFlow) -> Result<Stream> {
//         let host = cpal::default_host();
//         let input_device = host.default_input_device().expect("No input device available");
//         let input_config = input_device.default_input_config()?.config();
//         let input_channels = input_config.channels as usize;
//         println!("input config default: {:?}", input_config.channels);
//         println!("input config default: {:?}", input_config.sample_rate);

//         let mut opus_encoder_channels = Channels::Mono;
//         if input_channels == 2 {
//             opus_encoder_channels = Channels::Stereo;
//         }

//         let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//         let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

//         // used for creating packet header
//         let ssrc: u32 = 42;
//         let seq = Arc::new(AtomicU16::new(0));
//         let ts = Arc::new(AtomicU32::new(0));

//         let input_stream = input_device.build_input_stream(
//             &input_config,
//             move |data: &[i16], _: &cpal::InputCallbackInfo| {
//                 for &sample in data {
//                     sample_buffer.push(sample);
//                     if sample_buffer.len() >= FRAME_SIZE * input_channels {
//                         let mut out = [0u8; 4000];
//                         if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//                             let packet = Packet {
//                                 header: Header {
//                                     sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                                     timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//                                     ssrc,
//                                     payload_type: 97,
//                                     ..Default::default()
//                                 },
//                                 payload: Bytes::from(out[..len].to_vec()),
//                             };
//                             if let Err(e) = send_flow.send_rtp(&packet) {
//                                 eprintln!("Send RTP error: {:?}", e);
//                             }
//                         }
//                         sample_buffer.clear();
//                     }
//                 }
//             },
//             move |err| eprintln!("input stream error: {}", err),
//             None,
//         ).unwrap();

//         Ok(input_stream)
//     }

//     pub async fn init_output_stream(&self, playback_buffer: Arc<Mutex<VecDeque<i16>>>) -> Result<(Stream, usize), Error> {
//         // let playback_buffer_clone = playback_buffer.clone();

//         let host = cpal::default_host();
//         let output_device = host.default_output_device().expect("No output device available");
//         // let default_output_config = output_device.default_output_config()?.config();
//         // println!("output config default: {:?}", default_output_config.channels);
//         // println!("output config default: {:?}", default_output_config.sample_rate);

//         let output_config = cpal::StreamConfig {
//             channels: 2, // must be stereo
//             sample_rate: cpal::SampleRate(48_000), // your device only supports 48kHz
//             buffer_size: cpal::BufferSize::Default,
//         };

//         let output_channels = output_config.channels as usize;

//         // let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
//         // let mut pcm_out = vec![0i16; FRAME_SIZE * 2];

//         let output_stream = output_device.build_output_stream(
//             &output_config,
//             move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
//                 let mut buf = playback_buffer.lock().unwrap();
//                 let len = data.len().min(buf.len());

//                 // drain exactly that many samples
//                 for (out, sample) in data.iter_mut().zip(buf.drain(..len)) {
//                     *out = sample;
//                 }

//                 // fill any remaining output with silence if buffer underflowed
//                 for out in data[len..].iter_mut() {
//                     *out = 0;
//                 }
//             },
//             move |err| eprintln!("output stream error: {}", err),
//             None,
//         ).expect("output stream failed");
//         Ok((output_stream, output_channels))
//     }


//     pub fn decode_packet(packet: Packet, playback_buffer: Arc<Mutex<VecDeque<i16>>>, output_channels: usize) -> Result<()> {
//         // let flow_id = VarInt::from_u32(0);
//         // let mut recv_flow = session.new_receive_flow(flow_id).await.unwrap();

//         let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
//         let mut pcm_out = vec![0i16; FRAME_SIZE * 2];

//         if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
//             let mut buf = playback_buffer.lock().unwrap();
            
//             let decoded_channels = output_channels.clone(); // what Opus gave us
//             let samples_per_channel = decoded; // "decoded" is per channel
//             let gain = 1.0;

//             // println!("decoded_channels = {}, samples_per_channel = {}", decoded_channels, samples_per_channel);

//             for i in 0..samples_per_channel {
//                 if decoded_channels == 1 && output_channels == 2 {
//                     let s = pcm_out[i];
//                     buf.push_back(s); // left
//                     buf.push_back(s); // right
//                 } else {
//                     // other cases: channels match
//                     for ch in 0..output_channels {
//                         let s = pcm_out[i * decoded_channels + ch];
//                         buf.push_back(s);
//                     }
//                 }
//             }

//         }

//         Ok(())
//     }

//     pub async fn testing_input_device_task(&self, tx: Sender<Packet>){
//         let ssrc: u32 = 42;
//         let seq = Arc::new(AtomicU16::new(0));
//         let ts = Arc::new(AtomicU32::new(0));

//         // Shared playback buffer for decoded samples
//         let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));
//         // let playback_buffer = Arc::new(Mutex::new(Vec::<i16>::new()));

//         // Build the output stream ONCE
//         let playback_buffer_clone = playback_buffer.clone();

//         let host = cpal::default_host();

//         // Input device (mic)
//         let input_device = host.default_input_device().expect("No input device available");

//         let input_config = input_device.default_input_config().expect("error getting default config").config();
//         let input_channels = input_config.channels as usize;


//         let send_task = tokio::task::spawn(async move {
//             let seq = seq.clone();
//             let ts = ts.clone();

//             let mut opus_encoder_channels = Channels::Mono;
//             if input_channels == 2 {
//                 opus_encoder_channels = Channels::Stereo;
//             }

//             let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//             let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();

//             // let frame_size = 960; // 20ms @ 48kHz stereo
//             // let mut sample_buffer = Vec::with_capacity(frame_size * 2);
//             // let mut pcm_out = vec![0i16; frame_size * 2];
//             let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

//             println!("before input stream init");

//             // Input stream for mic capture
//             let input_stream = input_device.build_input_stream(
//                 &input_config,
//                 move |data: &[i16], _: &cpal::InputCallbackInfo| {
//                     println!("Audio callback fired, {} samples", data.len());
//                     for &sample in data {
//                         sample_buffer.push(sample);
//                         if sample_buffer.len() >= FRAME_SIZE * input_channels {
//                             let mut out = [0u8; 4000];
//                             if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//                                 let packet = Packet {
//                                     header: Header {
//                                         sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                                         timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//                                         ssrc,
//                                         payload_type: 97,
//                                         ..Default::default()
//                                     },
//                                     payload: Bytes::from(out[..len].to_vec()),
//                                 };
//                                 println!("sending packet to rx");
//                                 // let a = tx.send(packet).expect("failed to transmitt packet");
//                                 if tx.try_send(packet).is_err() {
//                                     // channel full, drop packet
//                                     eprintln!("Packet dropped");
//                                 }
//                                 // if let Err(e) = send_flow.send_rtp(&packet) {
//                                 //     // input from user in call is still streamed but fails to send
//                                 //     // since no other users in call
//                                 //     eprintln!("Send RTP error 123: {:?}", e);
//                                 //     println!("sample after conn lost error: {:?}", sample);
//                                 //     let error_code: VarInt = VarInt::from_u32(100);
//                                 //     let reason: &[u8] = b"connection ended / all users left the call";
//                                 //     connection.close(error_code, reason);
//                                 //     panic!("Input stream error: conn lost");
//                                 // }
//                             }
//                             sample_buffer.clear();
//                         }
//                     }
//                 },
//                 move |err| eprintln!("input stream error: {}", err),
//                 None,
//             ).unwrap();
//             input_stream.play().unwrap();
//             println!("Input stream started");
//         });

//         send_task.await;

//         println!("last line in input device task");
//     }

// }
