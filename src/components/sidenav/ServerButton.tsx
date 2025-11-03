import { useGlobalStore } from "../../state-management/globalStore";
import { IrohServerType, ServerMetadata, ServerType, TextChannel, VoiceChannel } from "../../types/serverTypes";
import { tryCatch } from "../../tryCatch";
import { invoke } from "@tauri-apps/api/core";
import { ChatMemberProfile } from "@pushprotocol/restapi";
import { push } from "../../push";
import { useServerStore } from "../../state-management/serverStore";

export function ServerButton(props: {metadata: ServerMetadata }){
  // const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer);
  const currentServer = useGlobalStore(globals => globals.currentServer);
  const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer);
  const setCurrentScreen = useGlobalStore(globals => globals.setCurrentScreen);
  const setUsers = useServerStore(server => server.setUsers)
  const setUserProfiles = useServerStore(server => server.setUserProfiles)
  const setCurrentTextChannel = useServerStore(server => server.setCurrentTextChannel)
  const clearMessages = useServerStore(server => server.clearMessages)

  let active = false;
  if(currentServer != null){
    if(currentServer.metadata.id == props.metadata.id){
      active = true;
    }
  }

  let visibility = 'invisible h-2 w-0 group-hover:h-5 group-hover:w-3 group-hover:visible'
  if(active){
    visibility = 'visible h-10 w-3'
  }

  async function fetchServer() {
    const result = await tryCatch(invoke("get_server", {id: props.metadata.id}));
    if(!result.error){
      console.log("Fetched server: ", result.data)
      const irohServerData: any | IrohServerType = result.data;

      let textChannels: TextChannel[] = []
      irohServerData.text_channels.map((textChannel: {name: string, chat_id: string}) => {
        console.log()
        textChannels.push({name: textChannel.name, chatId: textChannel.chat_id})
      })

      const server: ServerType = {
        metadata: irohServerData.metadata,
        currentTextChannel: textChannels[0],
        textChannels: textChannels,
        voiceChannels:  irohServerData.voice_channels,
        messages: [],
        reply: null,
        files: [],
        currentVoiceChannel: "",
        users: {
          admins: [],
          members: []
        },
        userProfiles: {},
        addChannelModalVisibility: false,
      }
      getUsers(textChannels[0].chatId)
      setCurrentTextChannel(textChannels[0])
      setCurrentScreen("Server")
      setCurrentServer(server)
      push.getHistory(textChannels[0].chatId)
    }
  }

  async function setServer(){
    if(!active){
      clearMessages()
      await fetchServer();
      const result = await tryCatch(invoke("set_current_server", {ticketStr: props.metadata.id}));
      if(!result.error){
        console.log("RESULT DATA: ", result.data);
      }
    }
  };

  function getUsers(chatId: string){
    console.log("getting users 1:", chatId)
    push.api!.chat.group.participants.list(
      chatId,
      {
        filter: {
          role: 'admin',
          pending: false,
        },
      }
    ).then((admins: {members: ChatMemberProfile[]}) => {
      console.log("admins:", admins)
      push.api!.chat.group.participants.list(
        chatId,
        {
          filter: {
            role: 'member',
            pending: false,
          },
        }
      ).then((members: {members: ChatMemberProfile[]}) => {
        console.log("members:", members)
        // let userProfiles: Map<string, UserProfile>
        let userProfiles: any = {}
        admins.members.map((member: ChatMemberProfile) => {
          userProfiles[member.address.split(':')[1].toLowerCase()] = member.userInfo.profile
          // userProfiles.set(member.address, member.userInfo.profile)
        })
        members.members.map((member: ChatMemberProfile) => {
          userProfiles[member.address.split(':')[1].toLowerCase()] = member.userInfo.profile
          // userProfiles.set(member.address, member.userInfo.profile)
        })
        // console.log("USER PROFILES: " + JSON.stringify(userProfiles))
        setUserProfiles(userProfiles)
        setUsers({admins: admins.members, members: members.members})
        // console.log("USER INFO 0:::" + JSON.stringify(admins.members[0].userInfo.profile.))
      })
    })
  }

  function Button(){
    const buttonStyle = `
      flex flex-col w-12 h-12 bg-deep-purple-300 rounded-xl 
      justify-center place-items-center duration-200 hover:scale-105 
      ml-4 shrink-0 overflow-hidden select-none`

      if(props.metadata.pic == ""){
        let serverInitials = "";
        const wordList = props.metadata.name.split(' ')
        let i = 0
        for(i; i < wordList.length; i++){
          if(wordList){
            serverInitials = serverInitials + wordList[i].charAt(0).toUpperCase()
          }
          if(i == 4){
            break;
          }
        }
        return(
          <>
            <button onClick={setServer} className={buttonStyle}>
              {serverInitials}
            </button>
          </>
        )
      }else{
        return(
          <>
            <button onClick={setServer} className={buttonStyle}>
              <img className="object-cover w-14 h-14 rounded-xl" src={props.metadata.pic} />
            </button>
          </>
        )
      }
  }

  return(
    <>
      <div className="pt-1.5">
        <div className="flex relative place-items-center group">
          <div className={"absolute -left-1.5 shrink-0 bg-deep-purple-100 rounded-full duration-300 " + visibility}/>
          <Button/>
        </div>
      </div>
    </>
  )
}

