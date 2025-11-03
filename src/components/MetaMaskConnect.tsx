import React, { useEffect, useState } from "react";
import { MetaMaskSDK } from "@metamask/sdk";

const MetaMaskConnect = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const connectMetaMask = async () => {
      const MMSDK = new MetaMaskSDK({
        dappMetadata: {
          name: "Cliqu3",
          url: 'https://cliqu3.com',
        },
        infuraAPIKey: "a17a5327444648fc9f26ae78c4cffaab",
      });

      const ethereum = MMSDK.getProvider();

      try {
        // MMSDK.disconnect();
        // let args: RequestArguments = 
        const accounts = await MMSDK.connect();
        // const accounts = await MMSDK.connectAndSign({msg : "Sign to give access to Cliqu3"});
        console.log("request next: ", ethereum);
        const exampleMessage = "This is a message to be signed. This is a message to be signed.";
        const messageHex = Buffer.from(exampleMessage, "utf8").toString("hex");
        console.log("hex msg: ", messageHex)
        const test = await ethereum?.request({method: "personal_sign", params: [JSON.stringify(messageHex), accounts[0]]})
        console.log("after request: ", test);
        setAccount(accounts[0]);
      } catch (err) {
        console.error("MetaMask connection failed", err);
      }
    };

    connectMetaMask();
  }, []);

  return (
    <>
      <div>
        <h2>MetaMask Connect</h2>
        {account ? <p>Connected: {account}</p> : <p>Connecting...</p>}
      </div>
    </>
  );
};

export default MetaMaskConnect;
