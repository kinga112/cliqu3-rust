import { useState } from "react"
import { useGlobalStore } from "../../state-management/globalStore"
import { useUserStore } from "../../state-management/userStore"
import EthereumProvider from "@walletconnect/ethereum-provider"
import { ethers } from "ethers"
import { push } from "../../push"
import { CONSTANTS, PushAPI } from "@pushprotocol/restapi"
import loader from "../../assets/icons/loader.svg"
import arrow from "../../assets/icons/arrow.svg"

const projectId = '418defda3aa82cefc151946c325b1bdf'

const provider = await EthereumProvider.init({
  projectId,
  chains: [1],
  methods: ["personal_sign"],
  showQrModal: true,
  qrModalOptions: {
    themeMode: "dark",
  },
});

provider.on("display_uri", (uri) => {
  console.log("display_uri", uri);
});

const ethersWeb3Provider = new ethers.providers.Web3Provider(provider);

export function WalletConnect(){
  const setAuth = useUserStore(user => user.setAuth)
  const setAddress = useUserStore(user => user.setAddress)
  const setProfile = useUserStore(user => user.setProfile)
  const showSavedUsers = useGlobalStore(globals => globals.showSavedUsers)
  const setShowSavedUsers = useGlobalStore(globals => globals.setShowSavedUsers)
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  async function connect(){
    await provider.connect();
    setConnected(true);
  }

  async function sign(){
    setLoading(true);
    const signer = ethersWeb3Provider.getSigner(provider.accounts[0]);
    const pushApi = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
    });

    console.log('Push user authenticated:', pushApi.account)
    pushApi.profile.info().then((profile: any) => {
      setProfile(profile)
    });
    await push.initApi(pushApi);
    // console.log("pushApi.decryptedPgpPvtKey: ", pushApi.decryptedPgpPvtKey)
    // localStorage.setItem("key", pushApi.decryptedPgpPvtKey!)
    // localStorage.setItem("account", pushApi.account)
    console.log("pushApi.acount: ", pushApi.account)

    let accounts = localStorage.getItem('accounts')
    if(accounts){
      let tmpAccounts: string[] = JSON.parse(accounts)
      if(!tmpAccounts.includes(pushApi.account)){
        tmpAccounts.unshift(pushApi.account)
        localStorage.setItem('accounts', JSON.stringify(tmpAccounts))
      }
    }else{
      localStorage.setItem('accounts', JSON.stringify([pushApi.account]))
    }

    localStorage.setItem(pushApi.account, pushApi.decryptedPgpPvtKey!)

    setAddress(pushApi.account);
    setAuth(true);
    setLoading(false);
  }

  async function onUserSignIn(signer: ethers.Wallet){
    // console.log("NEW USER: ", ethers.Wallet.createRandom().mnemonic)
    console.log("MNEMONIC: " + signer.address)
    const pushApi = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
    });
    pushApi.profile.info().then((profile: any) => {
      setProfile(profile)
    });
    let accounts = localStorage.getItem('accounts')
    if(accounts){
      let tmpAccounts: string[] = JSON.parse(accounts)
      if(!tmpAccounts.includes(pushApi.account)){
        tmpAccounts.unshift(pushApi.account)
        localStorage.setItem('accounts', JSON.stringify(tmpAccounts))
      }
    }else{
      localStorage.setItem('accounts', JSON.stringify([pushApi.account]))
    }

    localStorage.setItem(pushApi.account, pushApi.decryptedPgpPvtKey!)
    // setPushApi(user)
    await push.initApi(pushApi);
    setAddress(pushApi.account)
    setAuth(true);
    console.log("user: ", pushApi.account)
  }


  return(
    <>
      <div className={`absolute top-0 w-full h-full duration-300 ${showSavedUsers ? 'translate-x-full' : ''}`}>
        <button onClick={() => setShowSavedUsers(true)}><img className="absolute left-5 top-1/2 z-10 w-14 h-14" src={arrow}/></button>
        {/* <div className="flex flex-col w-full h-full justify-center place-items-center py-36 px-96"> */}
        <div className="flex flex-col w-full h-full justify-center place-items-center p-10 gap-2">
          <div className="text-deep-purple-100 text-2xl">Connect New Wallet</div>
          {/* <ConnectButton/> */}
          {/* <button onClick={() => onUserSignIn(ethers.Wallet.fromMnemonic("stem still jacket screen skill hip ice impulse wasp dice kidney border", "m/44'/60'/0'/0/0"))}> USER 1</button> */}
          {/* <button onClick={() => onUserSignIn(ethers.Wallet.fromMnemonic("stadium chase abuse leg monitor uncle pledge category flip luxury antenna extra", "m/44'/60'/0'/0/0"))}> USER 2</button> */}
          {/* <button onClick={() => onUserSignIn(ethers.Wallet.fromMnemonic("emotion senior sheriff base solve drink wall twelve cherry syrup pair evil","m/44'/60'/0'/0/0"))}> USER 3</button> */}
          {/* <button onClick={() => onUserSignIn(ethers.Wallet.fromMnemonic("such town matter tank extra key school journey forward become cross relax", "m/44'/60'/0'/0/0"))}> USER 4</button> */}
          {/* <button onClick={() => onUserSignIn(ethers.Wallet.fromMnemonic('shoulder soft collect rent pumpkin cloud virus awkward easy voice van furnace', "m/44'/60'/0'/0/0"))}> USER 5</button> */}
          { connected ? 
          <div className="flex flex-col gap-1 justify-center place-items-center">
            <div className="text-deep-purple-100 text-xl font-light">
              Sign Message to access Push Messaging Protocol
            </div>
            <button className="flex h-16 w-40 bg-deep-purple-100 text-deep-purple-400 rounded-xl font-medium text-xl justify-center place-items-center" onClick={sign}>
            {loading ? <img className="animate-spin" src={loader} height={30} width={30}/> :
            <div>Sign</div>
            }
            </button>
          </div>
          :
          <div className="pt-8">
            <button className="flex h-16 w-40 bg-deep-purple-100 text-deep-purple-300 hover:text-deep-purple-500 rounded-xl font-semibold text-xl hover:shadow-none duration-100 justify-center place-items-center" onClick={connect}>
              <div> Connect Wallet </div>
            </button>
          </div>
          }
          </div>
        </div>
    </>
  )
}