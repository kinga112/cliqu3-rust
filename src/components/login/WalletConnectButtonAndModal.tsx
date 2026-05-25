import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { invoke } from "@tauri-apps/api/core";
import { tryCatch } from "../../tryCatch";
import { useUserStore } from "../../state-management/userStore";
import loader from "../../assets/icons/loader2.svg";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { listen } from "@tauri-apps/api/event";

export default function WalletConnectButtonAndModal() {
  const setAuth = useUserStore((user) => user.setAuth);
  const [wcUri, setWcUri] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    // listen to wc_response event
    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        unlisten = await listen<any>("wc_response", async (event) => {
          // console.log("event:", event);
          console.log("event.payload.data:", event.payload.data);
          if (event.payload.data == "authenticated") {
            setAuth(true);
          }
        });
      } catch (err) {
        console.error("Failed to listen:", err);
      }
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  async function connectWallet() {
    setOpenModal(true);
    console.log("Connecting Wallet");
    const uri_result = await tryCatch(invoke("get_wc_uri"));
    if (!uri_result.error) {
      console.log("WC URL:{" + uri_result.data + "}");
      let uri = uri_result.data as string;
      setWcUri(uri);
      await tryCatch(invoke("init_wc", { uri }));
    }
  }

  return (
    <>
      <button
        onClick={connectWallet}
        className="h-16 w-42 rounded-lg bg-deep-purple-100 text-deep-purple-300 hover:text-deep-purple-500 text-xl"
      >
        Connect Wallet
      </button>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        className="relative z-50 select-none"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex w-screen items-center justify-center">
          <DialogPanel className="flex flex-col max-w-lg items-center gap-5 bg-deep-purple-200 p-10 rounded-4xl">
            <DialogTitle className="text-deep-purple-100 text-5xl text-center font-extralight">
              Scan with mobile wallet to Connect
            </DialogTitle>
            {wcUri == "" ? (
              <img
                src={loader}
                className="w-10 transition-all duration-200 animate-spin h-10"
              />
            ) : (
              <QRCodeSVG
                value={wcUri}
                height={350}
                width={350}
                className="rounded-xl p-2 bg-white"
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
