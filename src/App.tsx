import { useEffect } from "react";
import "./App.css";
import Home from "./screens/Home";
import Login from "./screens/Login";
import { useUserStore } from "./state-management/userStore";
// import { tryCatch } from "./tryCatch";
// import { invoke } from "@tauri-apps/api/core";
import Cookies from 'js-cookie';
// import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
// import { push } from "./push";

function App() {
  console.log("APP FUNCTION CALLED");
  const authorized = useUserStore(user => user.authorized)
  // const setAuth = useUserStore(user => user.setAuth)
  // const setProfile = useUserStore(user => user.setProfile)
  // const setAddress = useUserStore(user => user.setAddress)

  useEffect(() => {
    console.log("App Mounted - Authorized:", authorized)
    if(authorized){
      return;
    }
    
    let token = Cookies.get('session_token');
    console.log("COOKIE token: ", token)
    if(token){
      getSession();
    }
  }, [authorized])

  async function getSession(){
    // reinitialized state: pushApi, address, profile (everything else is default state)
    // const result = await tryCatch(invoke("get_session"));
    // if(!result.error){
    //   const pushApi = await PushAPI.initialize(null, {
    //     decryptedPGPPrivateKey: result.data as string,
    //     env: CONSTANTS.ENV.STAGING,
    //     account: "0x6cbC0AF4e8b1022aFaB474A68FdAbaD670BD452D",
    //   });
    //   await push.initApi(pushApi);
    //   pushApi.profile.info().then((profile: any) => {
    //     setProfile(profile)
    //   });
    //   setAuth(true)
    //   setAddress(pushApi.account);
    // }else{
    //   console.log("Error ", result.error)
    // }
  }

  return (
    <>
      <div className="overflow-hidden">
        {authorized ? <Home/> : <Login/>}
      </div>
    </>
  );
}

export default App;
