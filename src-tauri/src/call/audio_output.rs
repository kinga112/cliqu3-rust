use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, StreamConfig};
use iroh_roq::ReceiveFlow;
use opus::{Decoder, Channels};

const SAMPLE_RATE: u32 = 48_000;
const FRAME_SIZE: usize = 960; // 20ms @ 48kHz stereo

pub struct AudioOutput {
    device: Device,
    config: StreamConfig,
    // token: Option<CancellationToken>,

}

impl AudioOutput {
    pub fn new() -> Self {
        println!("AudioOuput::new");
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
        // Shared playback buffer for decoded samples
        let playback_buffer = Arc::new(Mutex::new(VecDeque::<i16>::new()));

        // cloned playback buffer for inside stream. causes deadlock inside output stream if not cloned
        let playback_buffer_clone = playback_buffer.clone();

        // audio cue when call starts
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

        let channels = self.config.channels as usize;
        let mut opus_decoder_channels = Channels::Mono;
        if channels == 2 {
            opus_decoder_channels = Channels::Stereo;
        }

        let mut decoder = Decoder::new(SAMPLE_RATE, opus_decoder_channels).unwrap();

        while let Ok(packet) = recv_flow.read_rtp().await {
            if let Ok(sample_length) = decoder.decode(&packet.payload, &mut pcm_out, false) {
                let mut buf = playback_buffer.lock().unwrap();
                // let gain = 1.0;

                for i in 0..sample_length {
                    // different for mono and stereo or below works?
                    for channel in 0..channels {
                        let s = pcm_out[i * channels + channel];
                        buf.push_back(s);
                    }
                }
            }
        }
    }
}
