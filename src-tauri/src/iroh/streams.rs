use std::sync::{Arc, Mutex};
use anyhow::{Error, Result};
use iroh_roq::rtp::{header::Header, packet::Packet};
use iroh_roq::SendFlow;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Stream};
use std::sync::atomic::{AtomicU16, AtomicU32, Ordering};
use bytes::Bytes;
use opus::{Encoder, Application, Channels};

const SAMPLE_RATE: u32 = 48_000;
const FRAME_SIZE: usize = 960; 

pub fn init_input_stream(send_flow: SendFlow) -> Result<Stream> {
    let host = cpal::default_host();
    let input_device = host.default_input_device().expect("No input device available");
    let input_config = input_device.default_input_config()?.config();
    let input_channels = input_config.channels as usize;
    println!("input config default: {:?}", input_config.channels);
    println!("input config default: {:?}", input_config.sample_rate);

    let mut opus_encoder_channels = Channels::Mono;
    if input_channels == 2 {
        opus_encoder_channels = Channels::Stereo;
    }

    let mut encoder = Encoder::new(SAMPLE_RATE, opus_encoder_channels, Application::Voip).unwrap();
    let mut sample_buffer = Vec::with_capacity(FRAME_SIZE * input_channels);

    // used for creating packet header
    let ssrc: u32 = 42;
    let seq = Arc::new(AtomicU16::new(0));
    let ts = Arc::new(AtomicU32::new(0));

    let input_stream = input_device.build_input_stream(
        &input_config,
        move |data: &[i16], _: &cpal::InputCallbackInfo| {
            for &sample in data {
                sample_buffer.push(sample);
                if sample_buffer.len() >= FRAME_SIZE * input_channels {
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
                        if let Err(e) = send_flow.send_rtp(&packet) {
                            eprintln!("Send RTP error: {:?}", e);
                        }
                    }
                    sample_buffer.clear();
                }
            }
        },
        move |err| eprintln!("input stream error: {}", err),
        None,
    ).unwrap();

    Ok(input_stream)
}