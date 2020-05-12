import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";
import { getRandomCharacterFromString } from "./helpers";
import Draw from "./Draw";
import Logo from "./Logo";
import Avatar from "./Avatar";
import WaitForPlayers from "./WaitForPlayers";
import typeImg from "./img/type.svg";

function getUserId() {
  const store = window.localStorage;
  let userId = store.getItem("userId");
  if (userId === null) {
    userId = uuidv4();
    store.setItem("userId", userId);
  }
  return userId;
}

interface GameProps extends RouteComponentProps {
  gameId?: string;
}

const Game = (props: GameProps) => {
  let gameId = props.gameId!;

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
    return (
      <Join
        handleDone={() => {
          /*TODO*/
        }}
      />
    );
  } else if (true) {
    return <WaitForPlayers gameId={gameId} />;
  } else {
    return <Type first={false} />;
  }
};

export default Game;

const Join = ({ handleDone }: { handleDone: () => void }) => {
  return <CreateOrJoin buttonLabel="Join game" handleDone={handleDone} />;
};

export const Create = (props: RouteComponentProps) => {
  const handleDone = async (avatar: string, name: string) => {
    // TODO store and load username and avatar in localStorage

    interface CreatedGameResponse {
      gameId: string;
    }

    const response = await window.fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: getUserId(),
        userName: name,
        userAvatar: avatar,
      }),
    });

    const createdGame: CreatedGameResponse = await response.json();
    const gameId = createdGame.gameId;

    navigate(`/g/${gameId}`);
  };

  return <CreateOrJoin buttonLabel="Create game" handleDone={handleDone} />;
};

const CreateOrJoin = ({
  buttonLabel,
  handleDone,
}: {
  buttonLabel: string;
  handleDone: (avatar: string, name: string) => void;
}) => {
  const [avatar, setAvatar] = React.useState("");

  const [name, setName] = React.useState("");

  const buttonDisabled = name === "";

  const handleChangeAvatar = React.useCallback((face) => setAvatar(face), []);

  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
      </div>
      <div className="Join-content">
        Click to pick your look:
        <br />
        <SelectAvatar handleChange={handleChangeAvatar} />
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
        <button
          className="button"
          disabled={buttonDisabled}
          onClick={() => handleDone(avatar, name)}
        >
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

  const [face, setFace] = React.useState(() =>
    getRandomCharacterFromString(faces)
  );

  const nextFace = () => {
    const newFace = faces.charAt((faces.indexOf(face) + 1) % faces.length);
    setFace(newFace);
  };

  React.useEffect(() => {
    handleChange(face);
  }, [face, handleChange]);

  return (
    <div className="SelectAvatar" onClick={nextFace}>
      <Avatar face={face} small={false} />
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
