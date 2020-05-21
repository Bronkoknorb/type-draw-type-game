import React from "react";
import { RouteComponentProps } from "@reach/router";

import { PlayerInfo, StoryContent } from "./model";
import { getPlayerId } from "./helpers";
import Type from "./Type";
import Draw from "./Draw";
import BigLogoScreen from "./BigLogoScreen";
import WaitForPlayersScreen, { WaitForGameStartScreen } from "./WaitForPlayers";
import GameFinishedAnimation from "./GameFinishedAnimation";
import Stories from "./Stories";
import { Join } from "./CreateOrJoin";
import { ConnectionLostErrorDialog } from "./ErrorDialogs";

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

function isFinalState(newPlayerState: PlayerState) {
  return (
    newPlayerState.state === "unknownGame" ||
    newPlayerState.state === "alreadyStartedGame" ||
    isStoriesState(newPlayerState)
  );
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
      if (isFinalState(newPlayerState)) {
        closeSocket();
      }
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

    const closeSocket = () => {
      console.log("Disconnecting from websocket");
      closed = true;
      socket.close();
    };

    return () => {
      closeSocket();
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
      return (
        <WaitForRoundFinished
          isTypeRound={playerState.isTypeRound}
          waitingForPlayers={playerState.waitingForPlayers}
        />
      );
    } else if (isStoriesState(playerState)) {
      return <GameFinished stories={playerState.stories} />;
    } else if (playerState.state === "alreadyStartedGame") {
      return (
        <Message>
          Sorry, the game has already started. You will see the created stories,
          once that game is finished.
        </Message>
      );
    } else {
      // unknown game
      return (
        <Message>
          Sorry, the game code <em>{gameId}</em> was not found.
        </Message>
      );
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

const WaitForRoundFinished = ({
  isTypeRound,
  waitingForPlayers,
}: {
  isTypeRound: boolean;
  waitingForPlayers: PlayerInfo[];
}) => {
  const roundAction = isTypeRound ? "typing" : "drawing";

  const waitingForPlayersText = waitingForPlayers.map((p) => p.name).join(", ");

  return (
    <Message>
      {`Waiting for other players to finish ${roundAction}:`}
      <br />
      {waitingForPlayersText}
    </Message>
  );
};

const GameFinished = ({ stories }: { stories: StoryContent[] }) => {
  const [showStories, setShowStories] = React.useState(false);

  if (!showStories) {
    return (
      <GameFinishedAnimation handleShowStories={() => setShowStories(true)} />
    );
  } else {
    return <Stories stories={stories} />;
  }
};

const Message = ({ children }: { children: React.ReactNode }) => {
  return <BigLogoScreen>{children}</BigLogoScreen>;
};

const LoadingGame = () => {
  return <div>Loading game...</div>;
};
