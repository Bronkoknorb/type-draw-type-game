import React from "react";
import { RouteComponentProps, Router } from "@reach/router";
import { v4 as uuidv4 } from "uuid";
import { getRandomCharacterFromString } from "./helpers";
import Home from "./Home";
import Draw from "./Draw";
import Logo from "./Logo";
import typeImg from "./img/type.svg";
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

  const handleDrawDone = React.useCallback((image: Blob) => {
    console.log("Sending drawn image");
    socketRef.current!.send(image);
  }, []);

  // TODO
  if (false) {
    return <Draw handleDone={handleDrawDone} />;
  } else if (false) {
    return <Create />;
  } else if (false) {
    return <Join />;
  } else if (true) {
    return <WaitForPlayers />;
  } else {
    return <Type first={false} />;
  }
};

const Join = () => {
  return <CreateOrJoin buttonLabel="Join game" />;
};

const Create = () => {
  return <CreateOrJoin buttonLabel="Create game" />;
};

const CreateOrJoin = ({ buttonLabel }: { buttonLabel: string }) => {
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
        <SelectAvatar handleChange={(face) => setAvatar(face)} />
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
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

const SelectAvatar = ({
  handleChange,
}: {
  handleChange: (face: string) => void;
}) => {
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
    <div className="SelectAvatar" onClick={nextFace}>
      <Avatar face={face} small={false} />
    </div>
  );
};

const Avatar = ({ face, small }: { face: string; small: boolean }) => {
  const className = small ? "Avatar Avatar-small" : "Avatar";

  return <div className={className}>{face}</div>;
};

const WaitForPlayers = () => {
  const buttonDisabled = true;

  const link = window.location.toString();

  return (
    <div className="WaitForPlayers">
      <div className="WaitForPlayers-left">
        <div className="Players-title">Players:</div>
        <div className="Players">
          <Player face="A">Player1</Player>
          <Player face="B">Player2</Player>
          <Player face="C">Player3</Player>
          <Player face="D">Player4</Player>
          <Player face="E">Player5</Player>
          <Player face="F">Player6</Player>
          <Player face="G">Player7</Player>
          <Player face="H">Player8</Player>
          <Player face="I">Player9</Player>
          <Player face="J">
            Player10xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </Player>
          <Player face="K">
            Player11 with a really really long name name name name name name
            name name name name name name name name name name name name name
            name name name name name name name name name name name name name
            name name name name name name name name name name name name name
            name name name name name
          </Player>
        </div>
      </div>
      <div className="WaitForPlayers-right">
        <Logo />
        <div>Waiting for players...</div>
        <div>Game Code:</div>
        <div className="field">xxxxx</div>
        <div>Link:</div>
        <div className="field">{link}</div>
        <div className="buttons">
          <button
            className="button"
            disabled={buttonDisabled}
            title={
              buttonDisabled
                ? "Waiting for more players"
                : "Let's get this party started!"
            }
          >
            Start Game
          </button>
          <button className="button button-red">Cancel Game</button>
        </div>
        <div className="small">
          Once the game is started, additional players cannot join any longer!
        </div>
      </div>
    </div>
  );
};

const Player = ({
  face,
  children,
}: {
  face: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="Player">
      <Avatar face={face} small={true}></Avatar>
      <div>{children}</div>
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
            <img src={typeImg} alt="Type" />
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
            Art by Player:
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

const Scrollable = ({ children }: { children: React.ReactNode }) => {
  return <div className="Scrollable">{children}</div>;
};
