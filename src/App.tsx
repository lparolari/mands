import React from "react";
import logo from "./logo-white.svg";
import "./App.css";
import { Mandala } from "./Mandala";

function App(): React.ReactElement {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div>
        <Mandala />
      </div>
    </div>
  );
}

export default App;
