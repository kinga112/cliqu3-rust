import { useGlobalStore } from "../../state-management/globalStore";
import {
  IrohServerType,
  ServerMetadata,
  ServerType,
  TextChannel,
  TextChannelMetaData,
} from "../../types/serverTypes";
import { tryCatch } from "../../tryCatch";
import { invoke } from "@tauri-apps/api/core";
// import { ChatMemberProfile } from "@pushprotocol/restapi";
import { push } from "../../push";
import { useServerStore } from "../../state-management/serverStore";
import { getMessagesFromCache } from "../../cache";
import { MemberProfile } from "../../types/userTypes";

export function ServerButton(props: { metadata: ServerMetadata }) {
  // const setCurrentServer = useGlobalStore(globals => globals.setCurrentServer);
  const currentServer = useGlobalStore((globals) => globals.currentServer);
  const setCurrentServer = useGlobalStore(
    (globals) => globals.setCurrentServer,
  );
  const setCurrentScreen = useGlobalStore(
    (globals) => globals.setCurrentScreen,
  );
  // const setUsers = useServerStore((server) => server.setUsers);
  // const setUserProfiles = useServerStore((server) => server.setUserProfiles);
  const setCurrentTextChannel = useServerStore(
    (server) => server.setCurrentTextChannel,
  );
  // const clearMessages = useServerStore((server) => server.clearMessages);
  // const appendOldMessages = useServerStore(
  // (server) => server.appendOldMessages,
  // );

  let active = false;
  if (currentServer != null) {
    if (currentServer.metadata.id == props.metadata.id) {
      active = true;
    }
  }

  let visibility =
    "invisible h-2 w-0 group-hover:h-5 group-hover:w-3 group-hover:visible";
  if (active) {
    visibility = "visible h-10 w-3";
  }

  async function fetchServer() {
    const result = await tryCatch(
      invoke("get_server", { id: props.metadata.id }),
    );
    if (!result.error) {
      console.log("Fetched server: ", result.data);
      const irohServerData: any | IrohServerType = result.data;

      let textChannels: TextChannelMetaData[] = [];
      irohServerData.text_channels.map(
        (textChannel: { name: string; chat_id: string }) => {
          textChannels.push({
            name: textChannel.name,
            id: textChannel.chat_id,
          });
        },
      );

      let textChannel = await getChat(textChannels[0].id);
      for (const [inboxId, member] of Object.entries(textChannel.members)) {
        if (member.name == "") {
          console.log("fetching cliqu3 profile");
          const result = await tryCatch(
            invoke("get_cliqu3_profile", {
              address: member.address,
            }),
          );
          if (!result.error) {
            console.log(
              "got cliqu3 profile for inboxId:",
              inboxId,
              ":",
              result.data,
            );
            let members = textChannel.members;
            const memberProfile = result.data as MemberProfile;
            members[inboxId] = memberProfile;
            const updatedTextChannel: TextChannel = {
              id: textChannel.id,
              name: textChannel.name,
              description: textChannel.description,
              messages: textChannel.messages,
              members: members,
            };
            setCurrentTextChannel(updatedTextChannel);
            // setName(result.data as string);
          } else {
            console.log("cliqu3 profile failed to fetch:", result.error);
          }
        } else {
          console.log("cliqu3 profile already fetched:", member.name);
        }
      }
      console.log("Text channel: ", textChannel);

      const server: ServerType = {
        metadata: irohServerData.metadata,
        currentTextChannel: textChannel,
        textChannels: textChannels,
        voiceChannels: irohServerData.voice_channels,
        // reply: null,
        files: [],
        currentVoiceChannel: "",
        // users: {
        //   admins: [],
        //   members: [],
        // },
        // userProfiles: {},
        addChannelModalVisibility: false,
      };
      // getUsers(textChannels[0].chatId);
      setCurrentTextChannel(textChannel);
      // let textChannel = getChat(textChannels[0].id);
      setCurrentScreen("Server");
      setCurrentServer(server);
      // push.getHistory(textChannels[0].chatId)
      // fetchCachedMessages(textChannels[0].chatId);
      // push.getNewMessages(textChannels[0].chatId);
    } else {
      console.log("error fetching server: ", result.error);
    }
  }

  async function getChat(id: string) {
    // tryCatch(invoke("get_conversation", { id })).then((result) => {
    //   if (!result.error) {
    //     // console.log("GET CHAT RESULT DATA: ", result.data);
    //     return result.data;
    //   } else {
    //     return "fail";
    //   }
    // });
    let errorTextChannel: TextChannel = {
      id: "",
      name: "",
      description: "",
      messages: [],
      members: {},
    };
    let result = await tryCatch(invoke("get_conversation", { id }));
    if (!result.error) {
      // console.log("GET CHAT RESULT DATA: ", result.data);
      return result.data as TextChannel;
    } else {
      return errorTextChannel;
    }
  }

  async function setServer() {
    if (!active) {
      // clearMessages();
      await fetchServer();
      const result = await tryCatch(
        invoke("set_current_server", { ticketStr: props.metadata.id }),
      );
      if (!result.error) {
        console.log("RESULT DATA: ", result.data);
      }
    }
  }

  // function getUsers(chatId: string) {
  //   // console.log("getting users 1:", chatId)
  //   push
  //     .api!.chat.group.participants.list(chatId, {
  //       filter: {
  //         role: "admin",
  //         pending: false,
  //       },
  //     })
  //     .then((admins: { members: ChatMemberProfile[] }) => {
  //       // console.log("admins:", admins)
  //       push
  //         .api!.chat.group.participants.list(chatId, {
  //           filter: {
  //             role: "member",
  //             pending: false,
  //           },
  //         })
  //         .then((members: { members: ChatMemberProfile[] }) => {
  //           // console.log("members:", members)
  //           // let userProfiles: Map<string, UserProfile>
  //           let userProfiles: any = {};
  //           admins.members.map((member: ChatMemberProfile) => {
  //             userProfiles[member.address.split(":")[1].toLowerCase()] =
  //               member.userInfo.profile;
  //             // userProfiles.set(member.address, member.userInfo.profile)
  //           });
  //           members.members.map((member: ChatMemberProfile) => {
  //             userProfiles[member.address.split(":")[1].toLowerCase()] =
  //               member.userInfo.profile;
  //             // userProfiles.set(member.address, member.userInfo.profile)
  //           });
  //           // console.log("USER PROFILES: " + JSON.stringify(userProfiles))
  //           setUserProfiles(userProfiles);
  //           setUsers({ admins: admins.members, members: members.members });
  //           // console.log("USER INFO 0:::" + JSON.stringify(admins.members[0].userInfo.profile.))
  //         });
  //     });
  // }

  // async function fetchCachedMessages(chatId: string) {
  //   const cachedMesssages = await getMessagesFromCache(chatId);
  //   appendOldMessages(cachedMesssages);
  // }

  function Button() {
    const buttonStyle = `
      flex flex-col w-12 h-12 bg-deep-purple-300 rounded-xl
      justify-center place-items-center duration-200 hover:scale-105
      ml-4 shrink-0 overflow-hidden select-none`;

    if (props.metadata.pic == "") {
      let serverInitials = "";
      const wordList = props.metadata.name.split(" ");
      let i = 0;
      for (i; i < wordList.length; i++) {
        if (wordList) {
          serverInitials = serverInitials + wordList[i].charAt(0).toUpperCase();
        }
        if (i == 4) {
          break;
        }
      }
      return (
        <>
          <button onClick={setServer} className={buttonStyle}>
            {serverInitials}
          </button>
        </>
      );
    } else {
      return (
        <>
          <button onClick={setServer} className={buttonStyle}>
            <img
              className="object-cover w-14 h-14 rounded-xl"
              src={props.metadata.pic}
            />
          </button>
        </>
      );
    }
  }

  return (
    <>
      <div className="pt-1.5">
        <div className="flex relative place-items-center group">
          <div
            className={
              "absolute -left-1.5 shrink-0 bg-deep-purple-100 rounded-full duration-300 " +
              visibility
            }
          />
          <Button />
        </div>
      </div>
    </>
  );
}
