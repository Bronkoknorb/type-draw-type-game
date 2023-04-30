import React from "react";
import { Routes, Route } from "react-router-dom";

import { toggleToFullscreenAndLandscapeOnMobile } from "./helpers";
import Home from "./Home";
import Game from "./Game";
import { Create, JoinWithCode } from "./CreateOrJoin";

import "./App.css";

const App = () => {
  React.useEffect(() => {
    window.document.body.addEventListener(
      "click",
      toggleToFullscreenAndLandscapeOnMobile
    );

    return () => {
      window.document.body.removeEventListener(
        "click",
        toggleToFullscreenAndLandscapeOnMobile
      );
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/join" element={<JoinWithCode />} />
        <Route path="/new" element={<Create />} />
        <Route path="/g/:gameId" element={<Game />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
