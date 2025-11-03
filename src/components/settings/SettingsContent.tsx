import { UpdateProfile } from "./content/UpdateProfile";

export function SettingsContent(props: {name: string}){
  switch(props.name){
    case 'Update Profile':
      return <UpdateProfile/>
    case 'Test Item 1':
      return <div>TEST ITEM 1</div> 
    case 'Test Item 2':
      return <div>TEST ITEM 2</div> 
    case 'Test Item 3':
      return <div>TEST ITEM 3</div> 
    default:
      return <UpdateProfile/>
  }
}
