import { useGlobalStore } from "../../state-management/globalStore"

export function SettingsNavButton(props: {name: string}){
  const settingsContent = useGlobalStore((globals) => globals.settingsContent)
  const setSettingsContent = useGlobalStore((globals) => globals.setSettingsContent)

  // console.log("SETTINGS CONTENT: ", settingsContent)

  let extraStyle = 'bg-off-black-500 hover:bg-off-black-400'
  if(props.name == settingsContent){
    extraStyle = 'bg-deep-purple-300 cursor-default'
  }

  return(
    <>
      <button className={"h-10 w-full  rounded-lg shrink " + extraStyle} onClick={() => {setSettingsContent(props.name); console.log(props.name)}}>
        {props.name}
      </button>
    </>
  )
}
