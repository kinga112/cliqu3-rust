// import SignClient from "@walletconnect/sign-client";
// import { useEffect, useState } from "react";
// import QRCode from "react-qr-code";
// import WalletConnectProvider from "@walletconnect/web3-provider";
// // import { BrowserProvider, ethers } from "ethers"; // ethers v6
// import { CONSTANTS, PushAPI } from '@pushprotocol/restapi';

// const projectId = "418defda3aa82cefc151946c325b1bdf";

// export function WalletConnectButton(){
//   const [showWCModal, setShowWCModal] = useState(false)
//   // async function initWalletConnect() {
//   //   // 1. Initialize SignClient
//   //   const client = await SignClient.init({
//   //     projectId,
//   //     metadata: {
//   //       name: "Cliqu3",
//   //       description: "WalletConnect + Tauri app",
//   //       url: "https://cliqu3.com", // any placeholder
//   //       icons: ["https://mydapp.local/icon.png"],
//   //     },
//   //   });

//   //   // 2. Create a new session — this returns a URI for QR
//   //   const { uri, approval } = await client.connect({
//   //     requiredNamespaces: {
//   //       eip155: {
//   //         methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
//   //         chains: ["eip155:1"], // Ethereum mainnet
//   //         events: ["accountsChanged", "chainChanged"],
//   //       },
//   //     },
//   //   });

//   //   // 3. If URI exists → this is what you show as QR
//   //   if (uri) {
//   //     console.log("WalletConnect URI:", uri);
//   //     setUri(uri)
//   //     // You can now show this in a QR modal or pass it to Tauri backend
//   //   }

//   //   // 4. Wait for approval (wallet connects)
//   //   const session = await approval();
//   //   console.log("Connected session:", session);
//   // }

//   return(
//     <>
//       <button 
//         onClick={() => setShowWCModal(true)}>
//         Connect Wallet
//       </button>
//       {/* <button 
//         data-dialog-target="modal"
//         className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2" type="button">
//         Open Modal
//       </button>
//       <WalletConnectModal/> */}
//       {showWCModal ? <WalletConnectModal/> : <div/>}
//     </>
//   )
// }

// function WalletConnectModal(){
//   const [uri, setUri] = useState<string | null>(null)
//   const [client, setClient] = useState<SignClient | null>(null)
//   const [session, setSession] = useState<any | null>(null)
//   const [provider, setProvider] = useState<BrowserProvider | null>(null)
  
//   useEffect(() => {
//     initWalletConnect()
//   }, [])

//   async function initWalletConnect() {
//     // 1. Initialize SignClient
//     const c = await SignClient.init({
//       projectId,
//       metadata: {
//         name: "Cliqu3",
//         description: "WalletConnect + Tauri app",
//         url: "https://cliqu3.com", // any placeholder
//         icons: ["https://mydapp.local/icon.png"],
//       },
//     });

//     // 2. Create a new session — this returns a URI for QR
//     const { uri, approval } = await c.connect({
//       requiredNamespaces: {
//         eip155: {
//           methods: ["personal_sign"],
//           chains: ["eip155:1"], // Ethereum mainnet
//           events: ["accountsChanged", "chainChanged"],
//         },
//       },
//     });

//     setClient(c);

//     // 3. If URI exists → this is what you show as QR
//     if (uri) {
//       console.log("WalletConnect URI:", uri);
//       setUri(uri)
//       // You can now show this in a QR modal or pass it to Tauri backend
//     }

//     // 4. Wait for approval (wallet connects)
//     const s = await approval();
//     console.log("Connected session:", s);
//     setSession(s)
//   }

//   function createPushSigner(session: any, client: any) {
//     if (!session) throw new Error("WalletConnect session not ready");

//       const account = session.namespaces.eip155.accounts[0].split(":")[2]; // "0xAbc..."

//       return {
//         async account() {
//           return account;
//         },

//         async getChainId() {
//           const chainId = session.namespaces.eip155.chains[0]; // e.g., "eip155:1"
//           return parseInt(chainId.split(":")[1], 10);
//         },

//         async signMessage({ message, account: _ }: { message: string; account: string }) {
//           return await client.request({
//             topic: session.topic,
//             chainId: "eip155:1",
//             request: {
//               method: "personal_sign",
//               params: [message, account],
//             },
//           }) as `0x${string}`;
//         },

//         async signTypedData(args: {
//           account: string;
//           domain: any;
//           types: any;
//           primaryType: string;
//           message: any;
//         }) {
//           const { account, domain, types, primaryType, message } = args;
//           return await client.request({
//             topic: session.topic,
//             chainId: "eip155:1",
//             request: {
//               method: "eth_signTypedData",
//               params: [account, JSON.stringify({ domain, types, primaryType, message })],
//             },
//           }) as `0x${string}`;
//         },
//       };
//     }


//   async function sign(){
//     // const accounts = session.namespaces.eip155.accounts;
//     // const address = accounts[0].split(":")[2]
//     // console.log("address: ", address)

//     // const pushSigner: any = {
//     //   async signMessage(message: string): Promise<string> {
//     //     const result = await client!.request({
//     //       topic: session.topic,
//     //       chainId: "eip155:1",
//     //       request: {
//     //         method: "personal_sign",
//     //         params: [message, session.accounts[0]],
//     //       },
//     //     });
//     //     return result as string;
//     //   },

//     //   async signTypedData(args: {
//     //     account: string;
//     //     domain: any;
//     //     types: any;
//     //     primaryType: string;
//     //     message: any;
//     //   }): Promise<`0x${string}`> {
//     //     const { account, domain, types, primaryType, message } = args;

//     //     const result = await client!.request({
//     //       topic: session.topic,
//     //       chainId: "eip155:1",
//     //       request: {
//     //         method: "eth_signTypedData",
//     //         params: [account, JSON.stringify({ domain, types, primaryType, message })],
//     //       },
//     //     });

//     //     return result as `0x${string}`;
//     //   },

//     //   async getChainId(): Promise<number> {
//     //     const [chainId] = session.chainIds; // e.g., ["eip155:1"]
//     //     return parseInt(chainId.split(":")[1], 10);
//     //   },

//     //   async account(): Promise<string> {
//     //     return session.accounts[0];
//     //   },
//     // };

//     const signer = createPushSigner(session, client);
//     // console.log("address: ", address)
//     const user = await PushAPI.initialize(signer, {
//       env: CONSTANTS.ENV.STAGING,
//     });

//     console.log('Push user authenticated:', user.account)
//   }


//   return(
//     <>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] p-5 rounded-xl bg-deep-purple-300">
//         <div className="flex flex-col gap-2 justify-center place-items-center">
//           {/* { uri ? <QR uri={uri}/> : <div>Loading ... </div>} */}
//           { session ? 
//             <div className="flex flex-col justify-center place-items-center gap-5 h-full">
//               <div className="text-deep-purple-100 text-2xl font-light text-center">Sign message in Wallet App to Login</div>
//               <button className="w-16 h-8 rounded bg-deep-purple-100 text-deep-purple-300 font-semibold" onClick={sign}> Sign </button> 
//             </div>
//             : 
//             uri ? <QR uri={uri}/> : <div>Loading ... </div>
//           }
//         </div>
//       </div>
//     </>
//   )
// }

// function QR(props: {uri: string}){
//   return(
//     <>
//       <div className="flex flex-col gap-5">
//         <QRCode
//           size={256}
//           style={{ height: "auto", maxWidth: "100%", width: "100%" }}
//           value={props.uri}
//           viewBox={`0 0 256 256`}
//         />
//         <div className="text-2xl text-deep-purple-100 font-thin text-center">
//           Scan QR with Wallet
//         </div>
//       </div>
//     </>
//   )
// }