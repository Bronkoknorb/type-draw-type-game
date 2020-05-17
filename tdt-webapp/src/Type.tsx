import React from "react";
import typeImg from "./img/type.svg";
import Scrollable from "./Scrollable";
import { PlayerInfo } from "./model";

const Type = ({
  round,
  rounds,
  drawingSrc,
  artist,
  handleDone,
}: {
  round: number;
  rounds: number;
  drawingSrc: string | null;
  artist: PlayerInfo | null;
  handleDone: (text: string) => void;
}) => {
  const [text, setText] = React.useState("");

  const buttonDisabled = text === "";

  const first = drawingSrc === null;

  return (
    <Scrollable>
      <div className="Type">
        <div>
          <div className="small">
            Round {round} of {rounds}
          </div>
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
            The next player will have to draw your text.
          </div>
        )}
        {!first && (
          <div>
            {
              // TODO add Avatar?
            }
            Art by {artist!.name}:
            <img src={drawingSrc!} className="Drawing" alt="Drawing" />
          </div>
        )}
        <button
          className="button"
          disabled={buttonDisabled}
          onClick={() => handleDone(text)}
        >
          Done
        </button>
      </div>
    </Scrollable>
  );
};

export default Type;
