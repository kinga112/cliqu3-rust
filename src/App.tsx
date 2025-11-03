import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { tryCatch } from "./tryCatch";
// import Login from "./screens/Login";
import Home from "./screens/Home";
import Login from "./screens/Login";
import { Push } from "./push";
// import { AppKitProvider } from "./components/WalletConnectButton";
// import Login from "./screens/Login";

function App() {
  return (
    <>
      {/* <Home/> */}
      <div className="overflow-hidden">
        <Login/>
      </div>
    </>
  );
}

export default App;
