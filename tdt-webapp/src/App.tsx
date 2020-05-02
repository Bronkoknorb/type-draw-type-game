import React from "react";
import { RouteComponentProps, Router, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";

import {
  toggleToFullscreenAndLandscapeOnMobile,
  getRandomCharacterFromString,
} from "./helpers";
import Draw from "./Draw";

import logo from "./logo.svg";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Home path="/" default />
        <Game path="/g/:gameId" />
      </Router>
    </div>
  );
};

export default App;

const Home = (props: RouteComponentProps) => {
  const handleStartNewGame = () => {
    navigate("/g/xyz"); // TODO game id
    toggleToFullscreenAndLandscapeOnMobile();
  };

  return (
    <div className="Home">
      <div className="Home-content">
        <div className="Home-header">
          <Drawing className="Drawing-left" chars="AFGHJKLMNOPRSTUVWXYZ" />
          <Logo />
          <Drawing className="Drawing-right" chars="abcefghijklmnopqrstu" />
        </div>
        <div className="Home-buttons">
          <button className="button" onClick={handleStartNewGame}>
            Start new game
          </button>
        </div>
      </div>
      <div className="Home-footer">
        <div>
          <a href="https://github.com/Bronkoknorb/type-draw-type-game">
            Open Source
          </a>{" "}
          by Hermann Czedik-Eysenberg
        </div>
      </div>
    </div>
  );
};

const Logo = () => (
  <div className="Logo">
    <img
      src={logo}
      alt="Type Draw Type Game"
      onClick={toggleToFullscreenAndLandscapeOnMobile}
    />
  </div>
);

const Drawing = ({
  chars,
  className,
}: {
  chars: string;
  className: string;
}) => {
  const getRandomDrawingChar = () => getRandomCharacterFromString(chars);

  const [drawingChar, setDrawingChar] = React.useState(getRandomDrawingChar);

  const nextDrawing = () => {
    setDrawingChar(getRandomDrawingChar());
  };

  return (
    <div className={"Drawing " + className} onClick={nextDrawing}>
      {drawingChar}
    </div>
  );
};

interface GameProps extends RouteComponentProps {
  gameId?: string;
}

const Game = (props: GameProps) => {
  let gameId = props.gameId;

  function getUserId() {
    const store = window.localStorage;
    let userId = store.getItem("userId");
    if (userId === null) {
      userId = uuidv4();
      store.setItem("userId", userId);
    }
    return userId;
  }

  React.useEffect(() => {
    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = wsProtocol + window.location.host + "/api/websocket";
    console.log("Connecting to websocket " + wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", (event) => {
      console.log("Websocket opened. Sending join action.");

      socket.send(
        JSON.stringify({
          action: "join",
          join: {
            gameId,
            userId: getUserId(),
          },
        })
      );
    });

    return () => {
      console.log("Disconnecting from websocket");
      socket.close();
    };
  }, [gameId]);

  // TODO
  if (true) {
    return <Draw />;
  } else {
    return <Join />;
  }
};

const Join = () => {
  const [avatar, setAvatar] = React.useState("");

  const [name, setName] = React.useState("");

  const buttonDisabled = name === "";

  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
      </div>
      <div className="Join-content">
        Click to pick your look:
        <br />
        <Avatar handleChange={(face) => setAvatar(face)} />
        <label htmlFor="name">Enter your name:</label>
        <input
          type="text"
          id="name"
          name="name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <br />
        <button className="button" disabled={buttonDisabled}>
          Join game
        </button>
      </div>
    </div>
  );
};

const Avatar = ({ handleChange }: { handleChange: (face: string) => void }) => {
  const faces = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const [face, setFace] = React.useState(() => {
    const initialFace = getRandomCharacterFromString(faces);
    handleChange(initialFace);
    return initialFace;
  });

  const nextFace = () => {
    const newFace = faces.charAt((faces.indexOf(face) + 1) % faces.length);
    handleChange(newFace);
    setFace(newFace);
  };

  return (
    <div className="Avatar" onClick={nextFace}>
      {face}
    </div>
  );
};
