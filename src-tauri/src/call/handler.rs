use iroh_roq::{ALPN, rtp::packet::Packet};
use iroh::{Endpoint, NodeAddr, PublicKey};
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;

use crate::call::{rtp::RTP};

// #[derive(Clone)]
pub struct CallHandler {
    token: Option<CancellationToken>,
}

impl CallHandler {
    // pub async fn new() -> Result<()>{
    pub fn new() -> Self {
        println!("call handler::new");
        Self { token: None }
    }

    pub async fn start(&mut self, endpoint: Endpoint) {
        let token = CancellationToken::new();
        let cloned_token = token.clone();
        tokio::task::spawn(async move {
            println!("running start call");
            while let Some(incoming) = endpoint.accept().await {
                if let Ok(connection) = incoming.await {
                    println!("got a connection from remote user to receive");
                    let mut rtp = RTP::new(connection);
                    let rtp_clone = rtp.clone();
                    // tokio::task::spawn(async move {
                    // });
                    rtp.send().await;
                    println!("after send");
                    loop {
                        tokio::select! {
                            _ = cloned_token.cancelled() => {
                                println!("Call cancelled, shutting down audio task");
                                break;
                            }
                            _ = rtp_clone.receive() => {
                                print!("rtp receive in tokio select");
                            }
                        }
                    }
                }
            }
        });
        println!("After start call task");
    }

    pub async fn join(&mut self, remote_pk_str: &str) {
        let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await.expect("endpoint failed");
        let remote_pk: PublicKey = remote_pk_str.to_string().parse().expect("invalid public string");
        let remote_node = NodeAddr::new(remote_pk);

        let token = CancellationToken::new();
        let cloned_token = token.clone();
        self.token = Some(token);

        tokio::task::spawn(async move {
            println!("running join call task");
            // connect to the current user in call
            if let Ok(connection) = endpoint.connect(remote_node, ALPN).await {
                println!("connected to remote user to receive packets");
                // create rtp connection
                // let rtp_conn = RTPConnection::new(connection);
                let rtp = RTP::new(connection);
                loop {
                    tokio::select! {
                        _ = cloned_token.cancelled() => {
                            println!("Call cancelled, shutting down audio task");
                            break;
                        }
                        _ = rtp.receive() => {
                            print!("rtp receive in tokio select");
                        }
                    }
                }
            }
            println!(" [   end of join receive task   ] ");
        });
    }

    pub fn leave_call(&self) {
        println!("leaving call");
        let token = self.token.clone().unwrap();
        token.cancel();
        println!("canceled task for audio call!");
    }

}
