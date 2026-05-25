// import { UserProfile } from "@pushprotocol/restapi";
// import { UserProfile } from "@pushprotocol/restapi/src";
import { useUserStore } from "../../../state-management/userStore";
import { UserInfoLarge } from "../../user/UserInfo";
import { useState } from "react";
import { MemberProfile } from "../../../types/userTypes";
import gallery from "../../../assets/icons/gallery.svg";
// import { push } from "../../../push";

export function UpdateProfile() {
  const address = useUserStore((user) => user.address);
  const profile = useUserStore((user) => user.profile);
  const setProfile = useUserStore((user) => user.setProfile);
  const [tempProfile, setTempProfile] = useState<MemberProfile>(profile!);
  // async function update() {
  //   const response = await push.api!.profile.update({
  //     name: tempProfile.name!,
  //     desc: tempProfile.desc!,
  //     picture: tempProfile.picture!,
  //   });
  //   console.log("Update Profile response: ", response);
  //   setProfile(tempProfile);
  // }
  //
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0]; // Get the selected file

      if (file) {
        // 2. Create a local temporary URL for the file
        const localUrl = URL.createObjectURL(file);
        // tempProfile.avatar = localUrl;
        // console.log("TEMP PROF:", tempProfile);
        // 3. Update state to instantly swap the image in the UI
        setTempProfile((prev) => ({ ...prev, avatar: localUrl }));
        // console.log("TEMP PROF:", tempProfile);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value != "") {
      setTempProfile((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    } else {
      if (event.target.name == "name") {
        setTempProfile((prev) => ({
          ...prev,
          [event.target.name]: profile!.name,
        }));
      }
      if (event.target.name == "description") {
        setTempProfile((prev) => ({
          ...prev,
          [event.target.name]: profile!.description,
        }));
      }
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-full p-10 place-items-center gap-4 bg-off-black-500">
        <div className="text-3xl font-extralight">Update your Profile</div>
        <div className="flex place-items-center gap-10">
          {/* Preview */}
          <div className="flex flex-col place-items-center gap-2">
            <UserInfoLarge profile={tempProfile} />
          </div>
          {/* Edit */}
          <div className="flex flex-col place-items-center gap-2">
            <div className="text-xl font-light">Edit Here</div>
            <div className="flex flex-col gap-2 bg-off-black-400 rounded-xl p-4 place-items-center">
              {/* <button className="relative w-20 h-20 group rounded-lg bg-off-black-700" onClick={() => openFilePicker()}> */}
              <div className="relative w-20 h-20 group rounded-lg bg-off-black-700">
                <img
                  className="absolute top-0 w-full h-full rounded-lg group-hover:opacity-20 shrink-0 object-cover select-none"
                  src={tempProfile.avatar}
                />
                <img
                  className="absolute top-5 left-5 w-10 h-10 group-hover:visible invisible"
                  src={gallery}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-sm">Display Name</div>
                <input
                  name="name"
                  className="rounded-lg p-2"
                  placeholder={profile!.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-sm">Description / Status</div>
                <input
                  name="description"
                  className="rounded-lg p-2"
                  placeholder={profile!.description}
                  onChange={handleInputChange}
                />
              </div>
              <button
                className="p-2 bg-deep-purple-300 border-2 border-deep-purple-300 hover:border-deep-purple-200 rounded-lg w-20"
                // onClick={update}
              >
                update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
