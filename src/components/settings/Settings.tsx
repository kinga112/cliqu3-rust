// import SettingsNav from "../SettingsNav";

import { useGlobalStore } from "../../state-management/globalStore";
import { SettingsContent } from "./SettingsContent";
import { SettingsNav } from "./SettingsNav";

export function Settings(){
  const settingsContent = useGlobalStore((globals) => globals.settingsContent)
  return(
    <>
      <div className="flex w-full h-full">
        <SettingsNav/>
        <SettingsContent name={settingsContent}/>
      </div>
    </>
  )
}
