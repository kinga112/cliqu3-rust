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

// use crate::call::encoder::OpusEncoder;
use crate::call::encoder::OpusEncoder;

// const MONO_20MS: usize = 48000 * 20 / 1000;
const SAMPLE_RATE: u32 = 48_000;
// const CHANNELS: usize = 2;
const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

pub struct AudioInput {
    device: Device,
    config: StreamConfig,
    // stream: Option<Stream>,
}

impl AudioInput {
    // pub async fn new() -> Result<()>{
    pub fn new() -> Self {
        println!("AudioInput::new");
        let host = cpal::default_host();
        let device = host.default_input_device().expect("No input device available");
        let config = device.default_input_config().expect("default input config failed").config();
        // Self { device, config, stream: None }
        Self { device, config }
    }

    pub async fn create_stream(&mut self, send_flow: SendFlow) {
        // creates input stream to send input samples over rtp connection
        let channels = self.config.channels as usize;
        let mut opus = OpusEncoder::new(channels);
        let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * channels);

        let stream = self.device.build_input_stream(
            &self.config,
            move |data: &[i16], _: &cpal::InputCallbackInfo| {
                for &sample in data {
                    // gather samples from mic and store in buffer
                    sample_buffer.push(sample);
                    // when buffer is large enough to create a packet, encode and send packet
                    if sample_buffer.len() >= FRAME_SIZE * channels {
                        // encode and send packet over rtp
                        let packet = opus.encode_sample(sample_buffer.clone()).expect("encoding error!");
                        if let Err(e) = send_flow.send_rtp(&packet) {
                            // let error_code: VarInt = VarInt::from_u32(100);
                            // let reason: &[u8] = b"connection ended / all users left the call";
                            // connection.close(error_code, reason);
                            println!("Input stream error: conn lost: {:?}", e);
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

        // fix relying on this...
        // how to keep alive ?? ..
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
            println!("another 10 seconds!");
        }
        println!(" [ end of input stream handle task!!! ] ");
        // });
    }
}
