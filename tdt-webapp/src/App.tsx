import React from "react";
import { RouteComponentProps, Router, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";

import {
  toggleToFullscreenAndLandscapeOnMobile,
  getRandomCharacterFromString,
} from "./helpers";
import Draw from "./Draw";

import logo from "./logo.svg";
import type from "./type.svg";

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
          <Decoration
            className="Decoration-left"
            chars="AFGHJKLMNOPRSTUVWXYZ"
          />
          <Logo />
          <Decoration
            className="Decoration-right"
            chars="abcefghijklmnopqrstu"
          />
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

const Decoration = ({
  chars,
  className,
}: {
  chars: string;
  className: string;
}) => {
  const getRandomDecorationChar = () => getRandomCharacterFromString(chars);

  const [decorationChar, setDecorationChar] = React.useState(
    getRandomDecorationChar
  );

  const nextDecoration = () => {
    setDecorationChar(getRandomDecorationChar());
  };

  return (
    <div className={"Decoration " + className} onClick={nextDecoration}>
      {decorationChar}
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

  const socketRef = React.useRef<WebSocket>();

  React.useEffect(() => {
    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = wsProtocol + window.location.host + "/api/websocket";
    console.log("Connecting to websocket " + wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
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
    };

    socket.onerror = (error) => {
      console.log("Websocket error", error);
    };

    return () => {
      console.log("Disconnecting from websocket");
      socket.close();
    };
  }, [gameId]);

  const handleDrawDone = (image: Blob) => {
    console.log("Sending drawn image");
    socketRef.current!.send(image);
  };

  // TODO
  if (false) {
    return <Draw handleDone={handleDrawDone} />;
  } else if (false) {
    return <Join />;
  } else {
    return <Type first={false} />;
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

const Type = ({ first }: { first: boolean }) => {
  const [text, setText] = React.useState("");

  const buttonDisabled = text === "";

  return (
    <Scrollable>
      <div className="Type">
        <div>
          <div className="small">Round X of Y</div>
          <h1>
            <img src={type} alt="Type" />
          </h1>
          <div>
            {first
              ? "... a sentence or short story:"
              : "... what you see on the drawing below:"}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {first && (
          <div className="small">
            Note: The next player will have to draw your text.
          </div>
        )}
        {!first && (
          <div>
            by Player:
            <img src="/api/image" className="Drawing" alt="Drawing" />
          </div>
        )}
        <button className="button" disabled={buttonDisabled}>
          Done
        </button>
      </div>
    </Scrollable>
  );
};

const Scrollable = ({ children }: { children: JSX.Element }) => {
  return <div className="Scrollable">{children}</div>;
};
