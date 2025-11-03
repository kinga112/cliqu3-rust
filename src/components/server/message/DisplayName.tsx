import { useEffect, useRef, useState } from "react";
import { useServerStore } from "../../../state-management/serverStore";
// import { Message } from "../../../cache";
import { UserInfoLarge } from "../../user/UserInfo";
import { Message } from "../../../types/messageTypes";

// function DisplayName(props: {message: Message}){
function DisplayName(props: {address: string}){
  const userProfiles = useServerStore(server => server.userProfiles)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 0;
    const menuWidth = menuRef.current?.offsetWidth || 0;

    let top = 0;
    let left = rect.left;

    console.log("RECT BOTTOM + MENU HEIGHT: " + (rect.bottom + menuHeight))
    console.log("INNER HEIGHT: " + window.innerHeight)

    // Check if menu goes beyond the bottom of the window
    if (rect.bottom + menuHeight > window.innerHeight-200) {
      top = -120
    }

    // Check if menu goes beyond the right side of the window
    if (rect.left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth;
    }

    setShowMenu(true);
    setMenuPosition({ top, left });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleCloseMenu();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let displayName = ''
  let picture: string | null = null

  if(userProfiles[props.address] != undefined){
    picture = userProfiles[props.address].picture!
    if(userProfiles[props.address].name != null){
      displayName = userProfiles[props.address].name!
    }else{
      displayName = props.address.substring(0,15)
    }
  }else{
    displayName = props.address.substring(0,15)
  }

  // console.log("DISOPLAY NAME FROM: ", props.message.from)
  // console.log("USER PROFILE: ", userProfiles[props.message.from])
  return(
    <>
      <div className="relative">
        <button onClick={handleClick} className="relative text-lg font-semibold hover:underline hover:text-deep-purple-200">
          {displayName}
        </button>
        {/* user profile */}
        {showMenu && menuPosition && (
        <div
          ref={menuRef}
          className="absolute shadow-lg w-96 h-36 bg-slate-400 rounded-xl z-50"
          style={{ top: `${menuPosition.top}px`, right: `-390px` }}
        >
          {/* <UserInfoLarge 
            address={props.message.from} 
            displayName={userProfiles[props.message.from].name!} 
            description={userProfiles[props.message.from].desc!} 
            picture={picture!} 
            edit={false}
          /> */}
          <UserInfoLarge 
            address={props.address}
            userProfile={userProfiles[props.address]}
          />
        </div>
        )}
      </div>
    </>
  )
}

export default DisplayName