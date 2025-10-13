// use anyhow::{Result, Error};
// use anyhow;
// use std::collections::VecDeque;
// use std::sync::{Arc, Mutex};
// use iroh_roq::rtp::{header::Header, packet::Packet};
// use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
// use cpal::{Device, Stream, StreamConfig};
// use iroh_roq::{VarInt, SendFlow};
// use std::sync::atomic::{AtomicU16, AtomicU32, Ordering};
// use bytes::Bytes;
// use opus::{Encoder, Decoder, Application, Channels};
// use tokio::sync::mpsc::Receiver;

// // const MONO_20MS: usize = 48000 * 20 / 1000;
// const SAMPLE_RATE: u32 = 48_000;
// // const CHANNELS: usize = 2;
// const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

// pub struct OpusEncoder {
//     #[Clone]
//     encoder: Encoder,
// }

// impl OpusEncoder {
//     // pub async fn new() -> Result<()>{
//     pub fn new(channels: usize) -> Self{
//         let mut opus_encoder_channels = Channels::Mono;

//         if channels == 2 {
//             opus_encoder_channels = Channels::Stereo;
//         }

//         let encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
//         Self { encoder }
//     }

//     pub fn encode_sample(&self, sample_buffer: Vec<i16>) -> Result<Packet, Error> {
//         let ssrc: u32 = 42;
//         let seq = AtomicU16::new(0);
//         let ts = AtomicU32::new(0);
//         let mut out = [0u8; 4000];
//         let encoder = self.encoder.clone();
//         if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
//             let packet = Packet {
//                 header: Header {
//                     sequence_number: seq.fetch_add(1, Ordering::Relaxed),
//                     timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
//                     ssrc,
//                     payload_type: 97,
//                     ..Default::default()
//                 },
//                 payload: Bytes::from(out[..len].to_vec()),
//             };
//             return Ok(packet)
//         }
//         Err(Error::msg("packet failed to encode"))
//     }
// }
