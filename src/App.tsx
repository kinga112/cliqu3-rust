import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { tryCatch } from "./tryCatch";
import Login from "./screens/Login";
import { Home } from "./screens/Home";

function App() {
  const [server, setServer] = useState<any>(null);
  const [serverName, setServerName] = useState("");
  const [serverId, setServerId] = useState("");
  const [fetchedId, setFetchedId] = useState<any>("");
  const [joinTicket, setJoinTicket] = useState("");
  const [inviteServerId, setInviteServerId] = useState("");
  const [ticket, setTicket] = useState<any>("");

  // useEffect(() => {
  //   init_db_state();
  // }, [])

  // async function init_db_state() {
  //   console.log("INIT STATE");
  //   await invoke("init_state");
  // }

  async function createServer() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    // setGreetMsg(await invoke("greet", { name }));
    console.log("serverName:", serverName)
    const server = {
        name: serverName,
        creator_address: "user1",
    }
    const result = await tryCatch(invoke("create_server", { server }))
    if(!result.error){
      // console.log("Created Server: ", serverId)
      setFetchedId(result.data)
    }else{
      console.log("FAIL")
    }
    setServerId("")
  }

    async function updateServer() {
      // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
      // setGreetMsg(await invoke("greet", { name }));
      console.log("serverId:", serverId)
      const server = {
          id: serverId,
          name: "test server 2",
          creator: "user 1",
      }
      const result = await tryCatch(invoke("update_server", { id: serverId, server }))
      if(!result.error){
        // console.log("Created Server: ", serverId)
        setFetchedId(result.data)
      }else{
        console.log("FAIL")
      }
      setServerId("")
    }

  async function getServer(){
    let id = serverId;
    const result = await tryCatch(invoke("get_server", { id }))
    if(!result.error){
      console.log("SUCCESS!", result.data)
      setServer(result.data)
    }else{
      console.log("FAIL")
    }
  }

  async function joinServer(){
    let ticket = joinTicket;
    const result = await tryCatch(invoke("join_server", { ticket }))
    if(!result.error){
      console.log("SUCCESS!", result.data)
    }else{
      console.log("FAIL")
    }
  }

  async function invite(){
    let id = inviteServerId;
    const result = await tryCatch(invoke("invite", { id }))
    if(!result.error){
      console.log("SUCCESS!", result.data)
      setTicket(result.data)
    }else{
      console.log("FAIL")
    }
  }

  return (
    // <main className="container">
    //   <h1>Cliqu3 App</h1>

    //   <form
    //     className="row"
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       createServer();
    //     }}
    //   >
    //     <input
    //       id="create-input"
    //       onChange={(e) => setServerName(e.currentTarget.value)}
    //       placeholder="Create with server Id..."
    //     />
    //     <button type="submit">Create Server</button>
    //   </form>

    //   <form
    //     className="row"
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       getServer();
    //     }}
    //   >
    //     <input
    //       id="update-input"
    //       onChange={(e) => setServerId(e.currentTarget.value)}
    //       placeholder="Get server with Id..."
    //     />
    //     <button type="submit">Get Server</button>
    //   </form>

    //   <form
    //     className="row"
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       updateServer();
    //     }}
    //   >
    //     <input
    //       id="get-input"
    //       onChange={(e) => setServerId(e.currentTarget.value)}
    //       placeholder="Update with server Id..."
    //     />
    //     <button type="submit">Update Server</button>
    //   </form>

    //   <form
    //     className="row"
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       joinServer();
    //     }}
    //   >
    //     <input
    //       id="join-input"
    //       onChange={(e) => setJoinTicket(e.currentTarget.value)}
    //       placeholder="Join with Ticket..."
    //     />
    //     <button type="submit">Join Server</button>
    //   </form>

      // <form
      //   className="row"
      //   onSubmit={(e) => {
      //     e.preventDefault();
      //     invite();
      //   }}
      // >
      //   <input
      //     id="invite"
      //     onChange={(e) => setInviteServerId(e.currentTarget.value)}
      //     placeholder="Invite with Server Id..."
      //   />
      //   <button type="submit">Get Invite Link</button>
      // </form>
    //   {server ?
    //     <div>
    //       <p>{server.id}</p>
    //       <p>{server.name}</p>
    //     </div>
    //     : <p/>
    //   }
    //   <div>
    //     {ticket}
    //   </div>
    //   <div>
    //     {fetchedId}
    //   </div>
     

    //   <Login/>
    // </main>
    <>
      <Home/>
    </>
  );
}

export default App;
