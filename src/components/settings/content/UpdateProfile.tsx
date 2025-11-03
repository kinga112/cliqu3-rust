// import { UserProfile } from "@pushprotocol/restapi";
import { UserProfile } from "@pushprotocol/restapi/src";
import { useUserStore } from "../../../state-management/userStore";
import { UserInfoLarge } from "../../user/UserInfo";
import { useState } from "react";
// import { useFilePicker } from 'use-file-picker';
// import {
//   FileAmountLimitValidator,
//   FileTypeValidator,
//   FileSizeValidator,
// } from 'use-file-picker/validators';
import gallery from "../../../assets/icons/gallery.svg"
import { push } from "../../../push";

export function UpdateProfile(){
  const address = useUserStore(user => user.address)
  const profile = useUserStore(user => user.profile)
  const setProfile = useUserStore(user => user.setProfile)
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile!)

  async function update(){
    const response = await push.api!.profile.update({
      name: tempProfile.name!,
      desc: tempProfile.desc!,
      picture: tempProfile.picture!
    });
    console.log("Update Profile response: ", response)
    setProfile(tempProfile)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as "name" | "desc"
    const value = event.target.value
    if(value){
      setTempProfile(prev => ({ ...prev, [name]: value}))
    }else{
      setTempProfile(prev => ({ ...prev, [name]: profile?.[name]!}))
    }
  }

  // const { openFilePicker } = useFilePicker({
  //   readAs: 'DataURL',
  //   accept: 'image/*',
  //   multiple: true,
  //   validators: [
  //     new FileAmountLimitValidator({ max: 1 }),
  //     // new FileTypeValidator(['jpg', 'png']),
  //     new FileSizeValidator({ maxFileSize: 1 * 1024 * 1024 /* 1 MB */ }),
  //   ],
  //   onFilesSelected: ({ filesContent, errors }) => {
  //     if(errors){
  //       console.log("ERRORS: ", errors)
  //     }else{
  //       console.log("NO ERROR FILES : ", filesContent)
  //       setTempProfile(prev => ({ ...prev, picture: filesContent[0].content}))
  //     }
  //   }
  // });
  
  return(
    <>
      <div className="flex flex-col w-full h-full p-10 place-items-center gap-4 bg-off-black-500">
        <div className="text-3xl font-extralight">
          Update your Profile
        </div>
        <div className="flex place-items-center gap-10">
          {/* Preview */}
          <div className="flex flex-col place-items-center gap-2">
            <div className="text-xl font-light">Preview</div>
            <UserInfoLarge address={address} userProfile={tempProfile}/>
          </div>
          {/* Edit */}
          <div className="flex flex-col place-items-center gap-2">
            <div className="text-xl font-light">Edit Here</div>
            <div className="flex flex-col gap-2 bg-off-black-400 rounded-xl p-4 place-items-center">
              {/* <button className="relative w-20 h-20 group rounded-lg bg-off-black-700" onClick={() => openFilePicker()}> */}
              <button className="relative w-20 h-20 group rounded-lg bg-off-black-700">
                <img className="absolute top-0 w-full h-full rounded-lg group-hover:opacity-20 shrink-0 object-cover select-none" src={tempProfile.picture!}/>
                <img className="absolute top-5 left-5 w-10 h-10 group-hover:visible invisible" src={gallery}/>
              </button>
              <div className="flex flex-col gap-0.5">
                <div className="text-sm">Display Name</div>
                <input name="name" className="rounded-lg p-2" placeholder={tempProfile.name!} onChange={handleInputChange}/>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-sm">Description / Status</div>
                <input name="desc" className="rounded-lg p-2" placeholder={tempProfile.desc!} onChange={handleInputChange}/>
              </div>
              <button className="p-2 bg-deep-purple-300 border-2 border-deep-purple-300 hover:border-deep-purple-200 rounded-lg w-20"
                      onClick={update}
              > 
                update 
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
