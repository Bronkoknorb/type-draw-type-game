import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";

import {
  getRandomCharacterFromString,
  isBlank,
  getPlayerId,
  useLocalStorageState,
} from "./helpers";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { ConnectionLostErrorDialog } from "./ErrorDialogs";

import "./CreateOrJoin.css";

export const Create = (props: RouteComponentProps) => {
  const [error, setError] = React.useState(false);

  const handleDone = async (avatar: string, name: string) => {
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

export const Join = ({
  handleDone,
}: {
  handleDone: (avatar: string, name: string) => void;
}) => {
  return <CreateOrJoin buttonLabel="Join game" handleDone={handleDone} />;
};

const CreateOrJoin = ({
  buttonLabel,
  handleDone,
}: {
  buttonLabel: string;
  handleDone: (avatar: string, name: string) => void;
}) => {
  const faces = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const [face, setFace] = useLocalStorageState("face", () =>
    getRandomCharacterFromString(faces)
  );

  const [name, setName] = useLocalStorageState("name", "");

  const buttonDisabled = isBlank(name);

  const handleChangeAvatar = (newFace: string) => setFace(newFace);

  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
      </div>
      <div className="Join-content">
        Pick your look:
        <br />
        <SelectAvatar
          face={face}
          faces={faces}
          handleChange={handleChangeAvatar}
        />
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
      </div>
    </div>
  );
};

const SelectAvatar = ({
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
    <div className="SelectAvatar" onClick={nextFace}>
      <Avatar face={face} small={false} />
    </div>
  );
};
