import { useState } from "react"
import hashtag from "../../assets/icons/hashtag.svg"

export function TextChannelButton(props: {name: string, }){
  let buttonStyle = 'flex w-full h-8 place-items-center p-0.5 mb-0.5 hover:bg-off-black-400 rounded-lg'

  const [active, setActive] = useState(false)
  if(active){
    buttonStyle = 'flex w-full h-8 place-items-center p-0.5 mb-0.5 bg-deep-purple-300 rounded-lg'
  }

  function changeChannel(){

  }

  return(
    <>
      <div className="w-full overflow-y-auto px-2">
        <button className={buttonStyle} onClick={changeChannel}>
          <div className="flex w-full justify-between">
            <div className="flex flex-row gap-2 overflow-hidden place-items-center">
              <img src={hashtag} height={20} width={20}/>
              <p className="truncate">{props.name}</p>
            </div>
            {/* <div className="flex place-items-center p-2">
              {props.unread ? <div className="flex place-items-center w-2 h-2 rounded-full bg-deep-purple-100"/> : <p/>}
            </div> */}
          </div>
        </button>
      </div>
    </>
  )
}
