import { useState } from "react";
import { Dialog } from '@mui/material';
import { useGlobalStore } from "../../../state-management/globalStore";
import { tryCatch } from "../../../tryCatch";
import { invoke } from "@tauri-apps/api/core";

export function CreateServerModal(){
  const showCreateServerModal = useGlobalStore(globals => globals.showCreateServerModal);
  const setShowCreateServerModal = useGlobalStore(globals => globals.setShowCreateServerModal)

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pic, setPic] = useState('');
  const [showError, setShowError] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("EVENT: " + event.target.value);
    setName(event.target.value)
  }

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("EVENT: " + event.target.value);
    setDescription(event.target.value)
  }

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("EVENT: " + event.target.value);
    setPic(event.target.value)
  }
  
  let textColor = 'text-deep-purple-300'
  if(showError){
    textColor = 'text-red-400'
  }

  async function createServer(){
      // const name = 'Star Wars!'
      // const pic = ''
    if(name == ''){
      setShowError(true);
    }else{
      const creatorAddress = '0x123456789'
      const result = await tryCatch(invoke("create_server", { name, pic, creatorAddress }))
      if(!result.error){
        console.log("Created Server: ", result.data)
      }else{
        console.log("FAIL")
      }
    }
  }

  return (
    <>
      <Dialog open={showCreateServerModal} onClose={() => setShowCreateServerModal(false)}>
        {/* <div className="fixed inset-0 flex w-screen items-center justify-center bg-red-500"> */}
          <div className="flex flex-col p-10 max-w-lg space-y-1 bg-deep-purple-300 text-deep-purple-100 select-none">
            <div className="font-light text-3xl">Create New Server</div>
            <div className={textColor}>Server name cannot be empty</div>
            <div className="flex gap-2">
              <div className="bg-deep-purple-100 rounded-xl w-32 h-32">
                {pic != '' ? <img className="w-32 h-32 rounded-xl object-cover" src={pic}/> : <div/>}
              </div>
              <div className="flex flex-col gap-1">
                <input className="bg-deep-purple-400 p-2 rounded-md " placeholder="server name" onChange={handleNameChange}/>
                <input className="bg-deep-purple-400 p-2 rounded-md" placeholder="description" onChange={handleDescriptionChange}/>
                <input className="bg-deep-purple-400 p-2 rounded-md" placeholder="icon image address link" onChange={handlePictureChange}/>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="bg-deep-purple-400 text-deep-purple-100 p-2 w-32 rounded-md duration-100 shadow-off-black-300 shadow-md hover:shadow-none hover:border-deep-purple-100" onClick={() => {createServer()}}>Create Server</button>
              <button className="bg-slate-900 p-2 w-20 rounded-md hover:text-red-400" onClick={() => {setShowCreateServerModal(false);setShowError(false);}}>Cancel</button>
            </div>
          </div>
      </Dialog>
    </>
  )
}
