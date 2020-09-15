import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Canvas} from "./Cavas"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <Canvas />
        </div>
      </header>
    </div>
  );
}

export default App;
