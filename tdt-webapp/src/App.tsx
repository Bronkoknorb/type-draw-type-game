import React from "react";
import { Router } from "@reach/router";
import Home from "./Home";
import Game, { Create } from "./Game";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Home path="/" default />
        <Create path="/new" />
        <Game path="/g/:gameId" />
      </Router>
    </div>
  );
};

export default App;
