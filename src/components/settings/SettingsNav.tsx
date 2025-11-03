// import { updatePeerInfo } from "../../gun";
import { useUserStore } from "../../state-management/userStore";
import { SettingsNavButton } from "./SettingsNavButton";


export function SettingsNav(){ 
  const setAuth = useUserStore(user => user.setAuth) 

  async function logout(){
    // console.log("LOGOUT RESETTING VIDEO PEER INFO")
    // localStorage.setItem("signer", "")

    // localStorage.removeItem('saved-user');
    // localStorage.removeItem('address');
    // localStorage.removeItem('signer');
    setAuth(false)
  }

  return(
    <>
      <div className="flex flex-col p-2 w-56 bg-off-black-600 border-r-1 border-off-black-400 shrink-0 h-full gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <SettingsNavButton name="Update Profile"/>
          <SettingsNavButton name="Test Item 1"/>
          <SettingsNavButton name="Test Item 2"/>
          <SettingsNavButton name="Test Item 3"/>
        </div>
        <button className="text-2xl font-extralight hover:text-red-500 mb-5"
          onClick={logout}
        >
         Logout
        </button>
      </div>
    </>
  )
}
