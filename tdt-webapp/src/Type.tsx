import React from "react";
import typeImg from "./img/type.svg";

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

export default Type;

const Scrollable = ({ children }: { children: React.ReactNode }) => {
  return <div className="Scrollable">{children}</div>;
};
