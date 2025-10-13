use anyhow::{Result, Error};
use anyhow;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use iroh_roq::rtp::{header::Header, packet::Packet};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Stream, StreamConfig};
use iroh_roq::{VarInt, SendFlow};
use std::sync::atomic::{AtomicU16, AtomicU32, Ordering};
use bytes::Bytes;
use opus::{Encoder, Decoder, Application, Channels};
use tokio::sync::mpsc::Receiver;

// const MONO_20MS: usize = 48000 * 20 / 1000;
const SAMPLE_RATE: u32 = 48_000;
// const CHANNELS: usize = 2;
const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

#[derive(Clone)]
pub struct AudioInput {
    device: Device,
    config: StreamConfig,
    // stream: Option<Stream>,
}

impl AudioInput {
    // pub async fn new() -> Result<()>{
    pub fn new() -> Self{
        println!("audio::new");
        let host = cpal::default_host();
        let device = host.default_input_device().expect("No input device available");
        let config = device.default_input_config().expect("default input config failed").config();
        // Self { device, config, stream: None }
        Self { device, config }
    }

    pub async fn create_stream(&mut self, send_flow: SendFlow) {
        // creates input stream to send input samples over rtp connection
        let channels = self.config.channels as usize;
        let mut opus_encoder_channels = Channels::Mono;

        if channels == 2 {
            opus_encoder_channels = Channels::Stereo;
        }

        let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();

        let ssrc: u32 = 42;
        let seq = AtomicU16::new(0);
        let ts = AtomicU32::new(0);

        let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * channels);

        println!("before building input stream");

        let stream = self.device.build_input_stream(
            &self.config,
            move |data: &[i16], _: &cpal::InputCallbackInfo| {
                // println!("inside input stream");
                for &sample in data {
                    // gather samples from mic and store in buffer
                    sample_buffer.push(sample);
                    // when buffer is large enough to create a packet, encode and send packet
                    if sample_buffer.len() >= FRAME_SIZE * channels {
                        let mut out = [0u8; 4000];
                        if let Ok(len) = encoder.encode(&sample_buffer, &mut out) {
                            let packet = Packet {
                                header: Header {
                                    sequence_number: seq.fetch_add(1, Ordering::Relaxed),
                                    timestamp: ts.fetch_add(FRAME_SIZE as u32, Ordering::Relaxed),
                                    ssrc,
                                    payload_type: 97,
                                    ..Default::default()
                                },
                                payload: Bytes::from(out[..len].to_vec()),
                            };
                            // println!("before sending input from mic to rtp endpoint");
                            if let Err(e) = send_flow.send_rtp(&packet) {
                                // input from user in call is still streamed but fails to send
                                // since no other users in call
                                eprintln!("Send RTP error 123: {:?}", e);
                                println!("sample after conn lost error: {:?}", sample);
                                let error_code: VarInt = VarInt::from_u32(100);
                                let reason: &[u8] = b"connection ended / all users left the call";
                                // connection.close(error_code, reason);
                                panic!("Input stream error: conn lost");
                            }
                        }
                        sample_buffer.clear();
                    }
                }
            },
            move |err| eprintln!("input stream error: {}", err),
            None,
        ).unwrap();
        stream.play().unwrap();
        // self.stream = Some(stream);
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
            println!("another 10 seconds!");
        }
        println!(" [ end of input stream handle task!!! ] ");
        // });
    }
}
