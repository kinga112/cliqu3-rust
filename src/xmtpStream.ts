import { listen, UnlistenFn } from "@tauri-apps/api/event";

let xmtpUnlistenFn: UnlistenFn | null = null;

interface XmtpStreamEvent {
  conversation_id: string;
  message_id: string;
}

export async function startXmtpStream() {
  // 1. If we already have a listener, don't start a second one
  if (xmtpUnlistenFn) {
    console.warn("XMTP Stream already running.");
    return;
  }

  try {
    console.log("Starting XMTP Stream listener...");

    // 2. Listen for the event emitted by your Rust tokio::spawn loop
    xmtpUnlistenFn = await listen<XmtpStreamEvent>(
      "xmtp_stream_event",
      async (event) => {
        console.log("XMTP Stream Event:", event.payload);
        // Do other logic here..
      },
    );

    console.log("XMTP Listener active.");
  } catch (err) {
    console.error("Failed to start XMTP stream:", err);
  }
}

export function stopXmtpStream() {
  if (xmtpUnlistenFn) {
    xmtpUnlistenFn();
    xmtpUnlistenFn = null;
    console.log("XMTP Stream stopped.");
  }
}
