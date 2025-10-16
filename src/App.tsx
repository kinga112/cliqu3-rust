import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { tryCatch } from "./tryCatch";
import Login from "./screens/Login";
import { Home } from "./screens/Home";

function App() {
  return (
    <>
      <Home/>
    </>
  );
}

export default App;
