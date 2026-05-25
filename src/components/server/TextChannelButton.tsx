import { useEffect, useState } from "react";
import hashtag from "../../assets/icons/hashtag.svg";
import { push } from "../../push";
import {
  ChatMemberProfile,
  GroupDTO,
  GroupInfoDTO,
} from "@pushprotocol/restapi";
import { useServerStore } from "../../state-management/serverStore";
import { getMessagesFromCache } from "../../cache";
import { TextChannel, TextChannelMetaData } from "../../types/serverTypes";
import { tryCatch } from "../../tryCatch";
import { invoke } from "@tauri-apps/api/core";

export function TextChannelButton(props: { metadata: TextChannelMetaData }) {
  // const [active, setActive] = useState(false)
  // const [channelData, setChannelData] = useState<
  //   GroupDTO | GroupInfoDTO | undefined
  // >(undefined);
  const currentTextChannel = useServerStore(
    (server) => server.currentTextChannel,
  );
  const setCurrentTextChannel = useServerStore(
    (server) => server.setCurrentTextChannel,
  );
  // const setUsers = useServerStore((server) => server.setUsers);
  // const setUserProfiles = useServerStore((server) => server.setUserProfiles);
  // const clearMessages = useServerStore((server) => server.clearMessages);
  // const appendOldMessages = useServerStore(
  //   (server) => server.appendOldMessages,
  // );

  let active = false;
  if (currentTextChannel.id == props.metadata.id) {
    active = true;
  }

  let buttonStyle =
    "flex w-full h-8 place-items-center p-0.5 mb-0.5 hover:bg-off-black-400 rounded-lg";
  if (active) {
    buttonStyle =
      "flex w-full h-8 place-items-center p-0.5 mb-0.5 bg-deep-purple-300 rounded-lg";
  }

  // useEffect(() => {
  //   fetchTextChannelData();
  // }, [channelData]);

  // async function fetchTextChannelData() {
  //   // console.log("chatid:", props.chatId)
  //   // const textChannelData = await push.api?.chat.group.info(props.chatId)
  //   // console.log("textchannel data:", textChannelData)
  //   // setChannelData(textChannelData)
  //   push.api?.chat.group.info(props.chatId).then((textChannelData) => {
  //     // console.log("fetched text channel data:", data)
  //     setChannelData(textChannelData);
  //   });
  // }

  // async function fetchCachedMessages() {
  //   const cachedMesssages = await getMessagesFromCache(props.chatId);
  //   appendOldMessages(cachedMesssages);
  // }

  async function changeChannel() {
    if (currentTextChannel.id != props.metadata.id) {
      console.log("Changing to text channel: ", props.metadata.name);
      const result = await tryCatch(
        invoke("get_conversation", {
          id: props.metadata.id,
        }),
      );
      if (!result.error) {
        // console.log("Current Text channel: ", result.data);
        const textChannel: TextChannel = result.data as TextChannel;
        console.log("TEXT CHANNEL:", textChannel);
        setCurrentTextChannel(textChannel);

        // Object.values(textChannel.members).forEach(async ([inboxId, member]) => {
        for (const [inboxId, member] of Object.entries(textChannel.members)) {
          if (member.name == "") {
            console.log("fetching ens name");
            const result = await tryCatch(
              invoke("get_ens_name", {
                address: member.address,
              }),
            );
            if (!result.error) {
              console.log("got ens for inboxId:", inboxId, ":", result.data);
              // setName(result.data as string);
            } else {
              console.log("ens failed:", result.error);
            }
          } else {
            console.log("ENS name already fetched:", member.name);
          }
        }
      }
      // clearMessages();
      // setCurrentTextChannel({ name: props.name, chatId: props.chatId });
      // fetchCachedMessages();
      // push.getNewMessages(props.chatId);
      // getUsers(props.chatId);
      // push.getHistory(props.chatId)
    }
  }

  // function getUsers(chatId: string) {
  //   console.log("getting users:", props.chatId);
  //   push.api?.chat.group.participants
  //     .list(chatId, {
  //       filter: {
  //         role: "admin",
  //         pending: false,
  //       },
  //     })
  //     .then((admins: { members: ChatMemberProfile[] }) => {
  //       console.log("admins:", admins);
  //       push.api?.chat.group.participants
  //         .list(chatId, {
  //           filter: {
  //             role: "member",
  //             pending: false,
  //           },
  //         })
  //         .then((members: { members: ChatMemberProfile[] }) => {
  //           console.log("members:", members);
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

  return (
    <>
      <div className="w-full overflow-y-auto px-2">
        <button className={buttonStyle} onClick={changeChannel}>
          <div className="flex w-full justify-between">
            <div className="flex flex-row gap-2 overflow-hidden place-items-center">
              <img src={hashtag} height={20} width={20} />
              <p className="truncate">{props.metadata.name}</p>
            </div>
            {/* <div className="flex place-items-center p-2">
              {props.unread ? <div className="flex place-items-center w-2 h-2 rounded-full bg-deep-purple-100"/> : <p/>}
            </div> */}
          </div>
        </button>
      </div>
    </>
  );
}
