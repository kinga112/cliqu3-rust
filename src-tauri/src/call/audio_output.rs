use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use iroh_roq::rtp::{header::Header, packet::Packet};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Stream, StreamConfig};
use iroh_roq::{ReceiveFlow, SendFlow, VarInt};
use std::sync::atomic::{AtomicU16, AtomicU32, Ordering};
use bytes::Bytes;
use opus::{Encoder, Decoder, Application, Channels};
use tokio::sync::mpsc::Receiver;

// const MONO_20MS: usize = 48000 * 20 / 1000;
const SAMPLE_RATE: u32 = 48_000;
// const CHANNELS: usize = 2;
const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

#[derive(Clone)]
pub struct AudioOutput {
    device: Device,
    config: StreamConfig,
    // token: Option<CancellationToken>,

}

impl AudioOutput {
    // pub async fn new() -> Result<()>{
    pub fn new() -> Self{
        println!("audio::new");
        // let token = CancellationToken::new();
        let host = cpal::default_host();
        let device = host.default_output_device().expect("No output device available");
        // let config = output_device.default_output_config().expect("output device config failed").config();
        let config = StreamConfig {
            channels: 2, // must be stereo
            sample_rate: cpal::SampleRate(48_000), // your device only supports 48kHz
            buffer_size: cpal::BufferSize::Default,
        };
        Self { device, config }
    }

    pub async fn create_stream(&self, mut recv_flow: ReceiveFlow) {
    // pub async fn create_stream(&self, mut rx: Receiver<Packet>) {
        // Shared playback buffer for decoded samples
        let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));

        // Build the output stream ONCE
        let playback_buffer_clone = playback_buffer.clone();

        let mut t = 0f32;

        {
            let mut buf = playback_buffer.lock().unwrap();
            for i in 0..4800 {
                let sample = ((i as f32 * 440.0 * 2.0 * std::f32::consts::PI / 48000.0).sin() * 30000.0) as i16;
                buf.push_back(sample); // left
                buf.push_back(sample); // right
            }
        }

        let stream = self.device.build_output_stream(
            &self.config,
            move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
                let mut buf = playback_buffer_clone.lock().unwrap();
                let len = data.len().min(buf.len());

                // drain exactly that many samples
                for (out, sample) in data.iter_mut().zip(buf.drain(..len)) {
                    *out = sample;
                }

                // fill any remaining output with silence if buffer underflowed
                for out in data[len..].iter_mut() {
                    *out = 0;
                }
            },
            move |err| eprintln!("output stream error: {}", err),
            None,
        ).expect("output stream failed");

        stream.play().expect("output stream play failed");

        let mut pcm_out = vec![0i16; FRAME_SIZE * 2];
        let mut decoder = Decoder::new(SAMPLE_RATE, Channels::Stereo).unwrap();
        let channels = self.config.channels as usize;

        // while let Some(packet) = rx.recv().await {
            // println!("received packet from rx in output stream!");
        while let Ok(packet) = recv_flow.read_rtp().await {
            if let Ok(decoded) = decoder.decode(&packet.payload, &mut pcm_out, false) {
                let mut buf = playback_buffer.lock().unwrap();
                let decoded_channels = channels.clone(); // what Opus gave us
                let samples_per_channel = decoded; // "decoded" is per channel
                // let gain = 1.0;

                for i in 0..samples_per_channel {
                    if decoded_channels == 1 && channels == 2 {
                        let s = pcm_out[i];
                        buf.push_back(s); // left
                        buf.push_back(s); // right
                    } else {
                        // other cases: channels match
                        for channel in 0..channels {
                            let s = pcm_out[i * decoded_channels + channel];
                            buf.push_back(s);
                        }
                    }
                }
            }
        }
    }

}
