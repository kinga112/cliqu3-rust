import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../App.css";

function Login() {
  const ran = useRef(false);

  useEffect(() => {
    initState();
  }, [])

  async function initState() {
    if (ran.current) return;
    ran.current = true;
    console.log("INIT STATE");
    await invoke("init_state");
  }

  return (
    <>
      <div>
        Login
      </div>
    </>
  );
}

export default Login;
