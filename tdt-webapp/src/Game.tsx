import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components/macro";
import { getRandomCharacterFromString, isBlank } from "./helpers";
import Type from "./Type";
import Draw from "./Draw";
import Logo from "./Logo";
import BigLogoScreen from "./BigLogoScreen";
import Avatar from "./Avatar";
import WaitForPlayersScreen, { WaitForGameStartScreen } from "./WaitForPlayers";
import { PlayerInfo, StoryContent } from "./model";
import Dialog from "./Dialog";
import Stories from "./Stories";

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

interface TypeState extends PlayerState {
  state: "type";
  round: number;
  rounds: number;
  drawingSrc: string | null;
  artist: PlayerInfo | null;
}

function isTypeState(playerState: PlayerState): playerState is TypeState {
  return playerState.state === "type";
}

interface DrawState extends PlayerState {
  state: "draw";
  text: string;
  textWriter: PlayerInfo;
  round: number;
  rounds: number;
}

function isDrawState(playerState: PlayerState): playerState is DrawState {
  return playerState.state === "draw";
}

interface WaitForRoundFinishState extends PlayerState {
  state: "waitForRoundFinish";
  waitingForPlayers: PlayerInfo[];
  isTypeRound: boolean;
}

function isWaitForRoundFinishState(
  playerState: PlayerState
): playerState is WaitForRoundFinishState {
  return playerState.state === "waitForRoundFinish";
}

interface StoriesState extends PlayerState {
  state: "stories";
  stories: StoryContent[];
}

function isStoriesState(playerState: PlayerState): playerState is StoriesState {
  return playerState.state === "stories";
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

  const [connectionError, setConnectionError] = React.useState(false);

  const [reconnectCount, setReconnectCount] = React.useState(0);

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
    let closed = false;

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

    socket.onerror = (error) => {
      if (!closed) {
        console.log("Websocket error", error);
        setConnectionError(true);
      }
    };
    socket.onclose = (closeEvent) => {
      if (!closed) {
        console.log("Websocket closed", closeEvent);
        setConnectionError(true);
      }
    };

    return () => {
      console.log("Disconnecting from websocket");
      closed = true;
      socket.close();
    };
  }, [gameId, reconnectCount]);

  const handleDrawDone = React.useCallback((image: Blob) => {
    socketRef.current!.send(image);
  }, []);

  const getComponentForState = () => {
    if (playerState.state === "loading") {
      return <LoadingGame />;
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
    } else if (isTypeState(playerState)) {
      const handleTypeDone = (text: string) => {
        send({ action: "type", content: { text } });
      };

      return (
        <Type
          round={playerState.round}
          rounds={playerState.rounds}
          drawingSrc={playerState.drawingSrc}
          artist={playerState.artist}
          handleDone={handleTypeDone}
        />
      );
    } else if (isDrawState(playerState)) {
      return (
        <Draw
          text={playerState.text}
          textWriter={playerState.textWriter}
          round={playerState.round}
          rounds={playerState.rounds}
          handleDone={handleDrawDone}
        />
      );
    } else if (isWaitForRoundFinishState(playerState)) {
      const roundAction = playerState.isTypeRound ? "typing" : "drawing";

      const waitingForPlayers = playerState.waitingForPlayers
        .map((p) => p.name)
        .join(", ");

      return (
        <Message>
          {`Waiting for other players to finish ${roundAction}:`}
          <br />
          {waitingForPlayers}
        </Message>
      );
    } else if (isStoriesState(playerState)) {
      return <Stories stories={playerState.stories} />;
    } else {
      // TODO
      return <Message>Unknown game</Message>;
    }
  };

  const handleReconnect = () => {
    setConnectionError(false);
    setReconnectCount(reconnectCount + 1);
  };

  return (
    <>
      <ConnectionLostErrorDialog
        show={connectionError}
        handleReconnect={handleReconnect}
      />
      {getComponentForState()}
    </>
  );
};

export default Game;

const ConnectionLostErrorDialogContent = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  h1 {
    color: red;
  }
`;

const ConnectionLostErrorDialog = ({
  show,
  handleReconnect,
}: {
  show: boolean;
  handleReconnect: () => void;
}) => {
  return (
    <Dialog show={show} highPriority={true}>
      <ConnectionLostErrorDialogContent>
        <div></div>
        <h1>ERROR</h1>
        <div>Connection to server lost</div>
        <button className="button" onClick={handleReconnect}>
          Click to re-connect
        </button>
      </ConnectionLostErrorDialogContent>
    </Dialog>
  );
};

const Message = ({ children }: { children: React.ReactNode }) => {
  return <BigLogoScreen>{children}</BigLogoScreen>;
};

const LoadingGame = () => {
  return <div>Loading game...</div>;
};

const Join = ({
  handleDone,
}: {
  handleDone: (avatar: string, name: string) => void;
}) => {
  return <CreateOrJoin buttonLabel="Join game" handleDone={handleDone} />;
};

export const Create = (props: RouteComponentProps) => {
  const [error, setError] = React.useState(false);

  const handleDone = async (avatar: string, name: string) => {
    // TODO store name and avatar in localStorage

    interface CreatedGameResponse {
      gameId: string;
    }

    try {
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
    } catch (e) {
      console.log("Error creating game", e);
      setError(true);
    }
  };

  return (
    <>
      <ConnectionLostErrorDialog
        show={error}
        handleReconnect={() => setError(false)}
      />
      <CreateOrJoin buttonLabel="Create game" handleDone={handleDone} />
    </>
  );
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

  const buttonDisabled = isBlank(name);

  const handleChangeAvatar = React.useCallback((face) => setAvatar(face), []);

  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
      </div>
      <div className="Join-content">
        Pick your look:
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
          onClick={() => handleDone(avatar, name.trim())}
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
