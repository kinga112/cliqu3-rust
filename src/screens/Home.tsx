import { useEffect, useRef, useState } from "react";
import { SideNav } from "../components/sidenav/SideNav";
import { invoke } from "@tauri-apps/api/core";
import Server from "../components/server/Server";
import { Splash } from "./Splash";
// import MetaMaskConnect from "../components/MetaMaskConnect";
// import ConnectButton from "../components/ConnectButton";
// import { WalletConnectButton } from "../components/WalletConnectButton";
// import Login from "./Login";
import { useGlobalStore } from "../state-management/globalStore";
import { DirectMessages } from "../components/dms/DirectMessages";
import { Settings } from "../components/settings/Settings";
import { useServerStore } from "../state-management/serverStore";
import { startXmtpStream } from "../xmtpStream";
import { useUserStore } from "../state-management/userStore";
import { MemberProfile } from "../types/userTypes";
import { tryCatch } from "../tryCatch";

export default function Home() {
  const profile = useUserStore((user) => user.profile);
  const address = useUserStore((user) => user.address);
  const setProfile = useUserStore((user) => user.setProfile);
  const ran = useRef(false);
  const [splash, setSpash] = useState(true);
  console.log("Home rendered");

  useEffect(() => {
    initState();
  }, []);

  async function initState() {
    if (ran.current) return;
    ran.current = true;
    console.log("INIT STATE");
    await invoke("init_state");
    await startXmtpStream();
    setSpash(false);
    initProfile();
  }

  async function initProfile() {
    console.log("init profile:", profile);
    if (!profile || profile!.name == "") {
      console.log("fetching cliqu3 profile");
      const result = await tryCatch(
        invoke("get_cliqu3_profile", {
          address: address,
        }),
      );
      if (!result.error) {
        console.log(
          "got cliqu3 profile for adress:",
          address,
          ":",
          result.data,
        );
        setProfile(result.data as MemberProfile);
        // setName(result.data as string);
      } else {
        console.log("cliqu3 profile failed to fetch:", result.error);
      }
    }
  }

  return (
    <>
      {splash ? (
        <Splash />
      ) : (
        <div className="flex relative bg-off-black-700 h-screen w-screen text-deep-purple-100 overflow-hidden">
          <SideNav />
          <div className="w-full h-full">
            <CurrentScreen />
          </div>
        </div>
      )}
    </>
  );
}

function CurrentScreen() {
  const currentScreen = useGlobalStore((globals) => globals.currentScreen);
  // const clearMessages = useServerStore((server) => server.clearMessages);
  switch (currentScreen) {
    case "Server":
      // clearMessages();
      return <Server />;
    case "DirectMessages":
      // clearMessages();
      return <DirectMessages />;
    case "Settings":
      // clearMessages();
      return <Settings />;
  }
}
