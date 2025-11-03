use iroh_roq::ALPN;
use iroh::{Endpoint, NodeAddr, PublicKey};
use tokio_util::sync::CancellationToken;

use crate::call::{rtp::RTP};

pub struct CallHandler {
    token: Option<CancellationToken>,
}

impl CallHandler {
    pub fn new() -> Self {
        // let token = CancellationToken::new();
        println!("call handler::new");
        Self { token: None }
    }

    pub async fn start(&mut self, endpoint: Endpoint) {
        // let token = &self.token;
        let token = CancellationToken::new();
        let start_token = token.clone();
        let receive_token = token.clone();
        self.token = Some(token);

        tokio::task::spawn(async move {
            println!("running start call");
            while let Some(incoming) = endpoint.accept().await {
                if let Ok(connection) = incoming.await {
                    println!("got a connection from remote user to receive");
                    let mut rtp = RTP::new(connection);
                    let cloned_start_token = start_token.clone();
                    rtp.send(cloned_start_token).await;
                    println!("after send");
                    loop {
                        tokio::select! {
                            _ = receive_token.cancelled() => {
                                println!("START: Call cancelled, shutting down audio task");
                                break;
                            }
                            _ = rtp.receive() => {
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
        // let token = &self.token;
        let token = CancellationToken::new();
        let start_token = token.clone();
        let receive_token = token.clone();
        self.token = Some(token);

        let endpoint = Endpoint::builder().discovery_n0().alpns(vec![ALPN.to_vec()]).bind().await.expect("endpoint failed");
        let remote_pk: PublicKey = remote_pk_str.to_string().parse().expect("invalid public string");
        let remote_node = NodeAddr::new(remote_pk);

        tokio::task::spawn(async move {
            println!("running join call task");
            // connect to the current user in call
            if let Ok(connection) = endpoint.connect(remote_node, ALPN).await {
                println!("connected to remote user to receive packets");
                let mut rtp = RTP::new(connection);
                rtp.send(start_token).await;
                loop {
                    tokio::select! {
                        _ = receive_token.cancelled() => {
                            println!("JOIN: Call cancelled, shutting down audio task");
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
        let token = self.token.as_ref().unwrap().clone();
        token.cancel();
        println!("canceled task for audio call!");
    }

}
