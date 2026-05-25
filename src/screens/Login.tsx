import WalletConnectButtonAndModal from "../components/login/WalletConnectButtonAndModal";
import { useEffect, useRef } from "react";
import { tryCatch } from "../tryCatch";
import { invoke } from "@tauri-apps/api/core";
import { useUserStore } from "../state-management/userStore";

export default function Login() {
  let setAuth = useUserStore((user) => user.setAuth);
  let setInboxId = useUserStore((user) => user.setAddress);
  console.log("Login rendered");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    get_session();
  }, []);

  async function get_session() {
    const result = await tryCatch(invoke("get_session"));
    if (!result.error) {
      setAuth(true);
      console.log("Session active: ", result.data);
      setInboxId(result.data as string);
    }
  }

  return (
    <>
      <div className="flex flex-row h-screen w-screen overflow-hidden p-0 bg-off-black-300 py-36 px-96">
        <div className="flex flex-col relative space-y-5 place-items-center h-full w-full p-20 bg-deep-purple-300 rounded-4xl overflow-hidden">
          <div className="text-6xl font-thin text-deep-purple-100 font-neuropol">
            C&nbsp;L&nbsp;I&nbsp;Q&nbsp;U&nbsp;3
          </div>
          <WalletConnectButtonAndModal />
          {/* <SavedUsers/> */}
          {/* <WalletConnect/> */}
        </div>
      </div>
    </>
  );
}
