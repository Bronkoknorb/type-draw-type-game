import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";
import { getRandomCharacterFromString } from "./helpers";
import Type from "./Type";
import Draw from "./Draw";
import Logo from "./Logo";
import BigLogoScreen from "./BigLogoScreen";
import Avatar from "./Avatar";
import WaitForPlayersScreen, { WaitForGameStartScreen } from "./WaitForPlayers";
import { PlayerInfo } from "./model";

function getPlayerId() {
  const store = window.localStorage;
  let playerId = store.getItem("playerId");
  if (playerId === null) {
    playerId = uuidv4();
    store.setItem("playerId", playerId);
  }
  return playerId;
}

interface GameProps extends RouteComponentProps {
  gameId?: string;
}

interface PlayerState {
  state: string;
}

interface WaitForPlayersState extends PlayerState {
  state: "waitForPlayers";
  players: PlayerInfo[];
}

function isWaitForPlayersState(
  playerState: PlayerState
): playerState is WaitForPlayersState {
  return playerState.state === "waitForPlayers";
}

interface WaitForGameStartState extends PlayerState {
  state: "waitForGameStart";
  players: PlayerInfo[];
}

function isWaitForGameStartState(
  playerState: PlayerState
): playerState is WaitForGameStartState {
  return playerState.state === "waitForGameStart";
}

interface TypeFirstState extends PlayerState {
  state: "typeFirst";
  rounds: number;
}

function isTypeFirstState(
  playerState: PlayerState
): playerState is TypeFirstState {
  return playerState.state === "typeFirst";
}

interface Action {
  action: string;
  content?: {
    [key: string]: string;
  };
}

const Game = (props: GameProps) => {
  const gameId = props.gameId!;

  const [playerState, setPlayerState] = React.useState({ state: "loading" });

  const socketRef = React.useRef<WebSocket>();

  const send = (action: Action) => {
    socketRef.current!.send(JSON.stringify(action));
  };

  React.useEffect(() => {
    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = `${wsProtocol}${window.location.host}/api/websocket`;
    console.log("Connecting to websocket " + wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Websocket opened. Sending access action.");

      send({
        action: "access",
        content: {
          gameId,
          playerId: getPlayerId(),
        },
      });
    };

    socket.onmessage = (messageEvent) => {
      const newPlayerState: PlayerState = JSON.parse(messageEvent.data);
      setPlayerState(newPlayerState);
    };

    // TODO handle close/error with dialog where the player can re-connect with a button
    socket.onerror = (error) => {
      console.log("Websocket error", error);
    };
    socket.onclose = (closeEvent) => {
      console.log("Websocket closed", closeEvent);
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

  if (playerState.state === "loading") {
    // TODO replace by almost empty screen (only text, no logo), to avoid flicker
    return <Message text="Loading game..." />;
  } else if (playerState.state === "join") {
    const handleJoinDone = (avatar: string, name: string) => {
      send({
        action: "join",
        content: {
          gameId,
          playerId: getPlayerId(),
          name,
          avatar,
        },
      });
    };

    return <Join handleDone={handleJoinDone} />;
  } else if (isWaitForPlayersState(playerState)) {
    const handleStartGame = () => {
      send({ action: "start" });
    };

    return (
      <WaitForPlayersScreen
        gameId={gameId}
        players={playerState.players}
        handleStart={handleStartGame}
      />
    );
  } else if (isWaitForGameStartState(playerState)) {
    return <WaitForGameStartScreen players={playerState.players} />;
  } else if (isTypeFirstState(playerState)) {
    return <Type first={true} round={1} rounds={playerState.rounds} />;
  } else if (false) {
    // TODO
    return <Draw handleDone={handleDrawDone} />;
  } else {
    // TODO
    return <Type first={false} round={999999} rounds={99999} />;
  }
};

export default Game;

const Message = ({ text }: { text: string }) => {
  return (
    <BigLogoScreen>
      <div>{text}</div>
    </BigLogoScreen>
  );
};

const Join = ({
  handleDone,
}: {
  handleDone: (avatar: string, name: string) => void;
}) => {
  return <CreateOrJoin buttonLabel="Join game" handleDone={handleDone} />;
};

export const Create = (props: RouteComponentProps) => {
  const handleDone = async (avatar: string, name: string) => {
    // TODO store name and avatar in localStorage

    interface CreatedGameResponse {
      gameId: string;
    }

    const response = await window.fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId: getPlayerId(),
        playerName: name,
        playerAvatar: avatar,
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