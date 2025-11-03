import Home from "./Home";
import { useUserStore } from "../state-management/userStore";
import { SavedUsers } from "../components/login/SavedUsers";
import { WalletConnect } from "../components/login/WalletConnect";

export default function Login(){
  const authorized = useUserStore(user => user.authorized)

  return (
    <>
      {
        authorized ?
        <Home/> 
        :
        <div className="flex flex-row h-screen w-screen overflow-hidden p-0 bg-off-black-300 py-36 px-96">
          <div className="flex flex-col relative space-y-5 place-items-center h-full w-full p-20 bg-deep-purple-300 rounded-4xl overflow-hidden">
            <div className="text-6xl font-thin text-deep-purple-100 font-neuropol">
              C&nbsp;L&nbsp;I&nbsp;Q&nbsp;U&nbsp;3
            </div>
            <SavedUsers/>
            <WalletConnect/>
          </div>
        </div>
      }
    </>
  )
}

