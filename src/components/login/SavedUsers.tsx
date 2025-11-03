import { UserProfile, PushAPI, CONSTANTS } from "@pushprotocol/restapi"
import { ethers } from "ethers"
import { useState, useEffect, useRef } from "react"
import { push } from "../../push"
import { useGlobalStore } from "../../state-management/globalStore"
import { useUserStore } from "../../state-management/userStore"
import { UserInfoLarge } from "../user/UserInfo"
import arrow from "../../assets/icons/arrow.svg"

export function SavedUsers(){
  const setAuth = useUserStore(user => user.setAuth)
  const setAddress = useUserStore(user => user.setAddress)
  const setProfile = useUserStore(user => user.setProfile)
  const showSavedUsers = useGlobalStore(globals => globals.showSavedUsers)
  const setShowSavedUsers = useGlobalStore(globals => globals.setShowSavedUsers)
  const savedAddresses = useGlobalStore(globals => globals.savedAddresses)
  const setSavedAddresses = useGlobalStore(globals => globals.setSavedAddresses)

  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([])
  const ran = useRef(false);

  useEffect(() => {
    if(ran.current) return;
    ran.current = true;
    getSavedUserData()
  }, [])

  async function getSavedUserData(){
    let pushApi: PushAPI | null = null
    // attempt to load saved tmp wallet
    // tmp wallet used to get public access account info from saved logins
    let savedTmpWallet = localStorage.getItem('tmpWallet')
    if(savedTmpWallet){
      let wallet = JSON.parse(savedTmpWallet)
      console.log("saved tmp wallet:", wallet)
      pushApi = await PushAPI.initialize(null, {
        decryptedPGPPrivateKey: wallet.key,
        env: CONSTANTS.ENV.STAGING,
        account: wallet.address
      });
    }else{
      let wallet = ethers.Wallet.createRandom()
      pushApi = await PushAPI.initialize(wallet, {
        env: CONSTANTS.ENV.STAGING,
      });
      // save random wallet to prevent creating repeats
      localStorage.setItem('tmpWallet', JSON.stringify({'address': pushApi.account, 'key': pushApi.decryptedPgpPvtKey!}))
    }
    
    const accountsJson = localStorage.getItem('accounts')
    if(accountsJson){
      let accounts = JSON.parse(accountsJson)
      setSavedAddresses(accounts)
      for(const address of accounts){
        const profile = await pushApi!.profile.info({overrideAccount: address})
        setSavedAccounts(prevAccounts => [...prevAccounts, profile])
      }
    }
  }

  async function loginSavedUser(address: string){
    const key = localStorage.getItem(address)

    if(key){
      const pushApi = await PushAPI.initialize(null, {
        decryptedPGPPrivateKey: key,
        env: CONSTANTS.ENV.STAGING,
        account: address,
      });
      pushApi.profile.info().then((profile: any) => {
        setProfile(profile)
      });
      await push.initApi(pushApi);
      setAddress(pushApi.account);
      setAuth(true);
    }
  }


  const savedAccountsList = savedAccounts.map((account: UserProfile, index: number) => {return <button key={savedAddresses[index]} onClick={() => loginSavedUser(savedAddresses[index])}><UserInfoLarge address={savedAddresses[index]} userProfile={account}/></button>})

  return(
    <>
    {/* <div className={`flex justify-center bg-off-black-500 w-full h-full py-36 px-96 duration-300 ${showSavedUsers ? '' : '-translate-x-full'}`}> */}
      <div className={`absolute top-0 w-full h-full duration-300 ${showSavedUsers ? '' : '-translate-x-full'}`}>
        <button onClick={() => setShowSavedUsers(false)}><img className="absolute right-5 top-1/2 z-10 w-14 h-14 rotate-180" src={arrow}/></button>
        {/* <div className="flex flex-col gap-2 bg-off-black-600 p-5 place-items-center w-full h-full"> */}
        <div className="flex flex-col w-full h-full gap-5 pt-36 pb-14 place-items-center">
          <div className="text-deep-purple-100 text-2xl">Saved Accounts</div>
          {/* {savedAccounts.length > 0 ? <button onClick={loginSavedUser}><UserInfoLarge address={"Test Address"} userProfile={savedAccounts[0]}/></button> : <div/>} */}
          {savedAccounts.length > 0 ? 
            <div className="flex flex-col overflow-y-scroll no-scrollbar">
              <div className="h-2 w-full rounded-full bg-deep-purple-100"></div>
              <div className="flex flex-col gap-2 overflow-y-scroll no-scrollbar shadow-off-black-600 rounded-xl p-2">
                {savedAccountsList}
              </div>
              <div className="h-2 w-full rounded-full bg-deep-purple-100"></div>
            </div>
          : <div className="text-deep-purple-100 text-xl font-light"> No Saved Accounts</div>
          }
        </div>
        {/* </div> */}
      </div>
    </>
  )
}
