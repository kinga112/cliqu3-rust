use iroh::endpoint::Connection;
use iroh_roq::{Session, VarInt, ReceiveFlow, rtp::packet::Packet};
use tokio::sync::mpsc;
// use tokio::sync;

use crate::call::{audio_input::AudioInput, audio_output::AudioOutput};

#[derive(Clone)]
pub struct RTP {
    session: Session,
    // input: AudioInput,
    // output: AudioOutput,
}

impl RTP {
    pub fn new(conn: Connection) -> Self {
        println!("connection::new");
        let session = Session::new(conn);
        // let input = AudioInput::new();
        // let output = AudioOutput::new();
        // Self { session, input, output }
        Self { session }
    }

    pub async fn send(&mut self) {
        let flow_id = VarInt::from_u32(0);
        println!("creating send flow and input stream");
        let send_flow = self.session.new_send_flow(flow_id).await.unwrap();
        // self.input.create_stream(send_flow).await;
        tokio::task::spawn(async move {
            let mut input = AudioInput::new();
            input.create_stream(send_flow).await;
        });
        println!("[  after input stream  ] ")
    }

    pub async fn receive(&self) {
    // pub async fn receive(&self, tx: Sender<Packet>) {
        let flow_id = VarInt::from_u32(0);
        let recv_flow: ReceiveFlow = self.session.new_receive_flow(flow_id).await.unwrap();
        // self.output.create_stream(recv_flow).await;
        let output = AudioOutput::new();
        output.create_stream(recv_flow).await;
        println!(" [   end of rtp receive!   ]")
    }

}
