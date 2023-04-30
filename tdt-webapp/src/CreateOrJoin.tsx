import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";

import {
  toggleToFullscreenAndLandscapeOnMobile,
  getRandomCharacterFromString,
  isBlank,
  getPlayerId,
  useLocalStorageState,
} from "./helpers";
import Logo from "./Logo";
import Face from "./Face";
import HowToButtonAndDialog from "./HowToButtonAndDialog";
import { ConnectionLostErrorDialog } from "./ErrorDialogs";

import "./CreateOrJoin.css";

export const Create = (_: RouteComponentProps) => {
  const [error, setError] = React.useState(false);

  const handleDone = async (face: string, name: string) => {
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
          playerFace: face,
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

export const Join = ({
  handleDone,
}: {
  handleDone: (face: string, name: string) => void;
}) => {
  return <CreateOrJoin buttonLabel="Join game" handleDone={handleDone} />;
};

const CreateOrJoin = ({
  buttonLabel,
  handleDone,
}: {
  buttonLabel: string;
  handleDone: (face: string, name: string) => void;
}) => {
  const faces = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const [face, setFace] = useLocalStorageState("face", () =>
    getRandomCharacterFromString(faces)
  );

  const [name, setName] = useLocalStorageState("name", "");

  const buttonDisabled = isBlank(name);

  const handleChangeFace = (newFace: string) => setFace(newFace);

  return (
    <LogoLeftScreen>
      Pick your look:
      <br />
      <SelectFace face={face} faces={faces} handleChange={handleChangeFace} />
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
        onClick={() => handleDone(face, name.trim())}
      >
        {buttonLabel}
      </button>
    </LogoLeftScreen>
  );
};

const LogoLeftScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
        <HowToButtonAndDialog />
      </div>
      <div className="Join-content">{children}</div>
    </div>
  );
};

const SelectFace = ({
  face,
  faces,
  handleChange,
}: {
  face: string;
  faces: string;
  handleChange: (face: string) => void;
}) => {
  const nextFace = () => {
    const newFace = faces.charAt((faces.indexOf(face) + 1) % faces.length);
    handleChange(newFace);
  };

  return (
    <div className="SelectFace" onClick={nextFace}>
      <Face face={face} small={false} />
    </div>
  );
};

const CODE_LENGTH = 5;
const codePattern = `^[a-z0-9]{${CODE_LENGTH}}$`;
const codeRegex = new RegExp(codePattern);

export const JoinWithCode = (_: RouteComponentProps) => {
  const [code, setCode] = React.useState("");

  const buttonDisabled = !codeRegex.test(code);

  const handleChangeCode = (newCode: string) => {
    setCode(newCode.toLowerCase());
  };

  const handleJoin = () => {
    navigate(`/g/${code}`);
    toggleToFullscreenAndLandscapeOnMobile();
  };

  return (
    <LogoLeftScreen>
      <label htmlFor="code">Enter Game Code:</label>
      <input
        type="text"
        id="code"
        name="code"
        minLength={CODE_LENGTH}
        maxLength={CODE_LENGTH}
        pattern={codePattern}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        value={code}
        onChange={(event) => handleChangeCode(event.target.value)}
      />
      <br />
      <button
        className="button"
        disabled={buttonDisabled}
        onClick={handleJoin}
        title={buttonDisabled ? "Game code should have five characters" : ""}
      >
        Join game
      </button>
    </LogoLeftScreen>
  );
};
