import { useDirectMessageStore } from '../../state-management/dmStore'
import { DirectMessage } from './DirectMessage'
import { DirectMessagesNav } from './nav/DirectMessagesNav'
import NewDirectMessage from './NewDirectMessage'

export function DirectMessages(){
  const newMessage = useDirectMessageStore(dm => dm.newMessage)
  return(
    <>
      <div className="flex w-full h-full">
        <DirectMessagesNav/>
        { newMessage ? <NewDirectMessage/> : <DirectMessage/> }
      </div>
    </>
  )
}
