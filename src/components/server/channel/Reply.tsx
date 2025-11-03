import { useServerStore } from "../../../state-management/serverStore"
import close from "../../../assets/icons/close.svg"

export function Reply(){
  const setReply = useServerStore((server) => server.setReply)
  const reply = useServerStore((server) => server.reply)
  // console.log("REPLY IN REPLY: " + reply.reference)
  
  let showReply = 'invisible'
  if(reply){
    showReply = 'visible'
  }

  let overflow = false
  if(reply){
    if(reply.message){
      if(reply.message.length >= 50){
        overflow = true
      }
    }
  }

  return(
    <>
      <div className={"absolute z-50 -top-4 rounded-e-md rounded-tl-md p-1 bg-deep-purple-300 " + showReply}>
        <div className="flex gap-3">
          <div className="flex gap-0">
            <p>Replying to: "{reply?.message}</p>
            {overflow ? <p>...</p> : <p/>}
            <p>"</p>
          </div>
          <button onClick={() => setReply(null)}>
            <img className="hover:bg-red-700 rounded-full" src={close} height={25} width={25}/>
          </button>
        </div>
      </div>
    </>
  )
}
