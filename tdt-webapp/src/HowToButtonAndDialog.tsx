import React from "react";
import styled from "styled-components";

import Dialog from "./Dialog";
import Scrollable from "./Scrollable";

const HowToButtonAndDialog = () => {
  const [showHowToDialog, setShowHowToDialog] = React.useState(false);

  return (
    <>
      <Dialog show={showHowToDialog}>
        <Scrollable>
          <HowToDialogContent>
            <h1>How to play?</h1>
            <div className="HowToDialogContent-text">
              <em>Type Draw Type</em> is a lively party game that combines
              creativity and laughter, perfect for you and your friends. Think
              of it as a twist on the classic telephone game, but with drawings!
              <br />
              Here's how it works: Each player starts by writing a sentence.
              That sentence is then passed to the next player, who must
              illustrate it. The drawing is then passed on, and the next player
              describes it with a new sentence - without knowing the original!
              This cycle of typing and drawing continues until everyone has
              contributed to every "story".
              <br />
              At the end, you'll unveil the hilarious transformations of each
              story and marvel at how wildly things can change along the way.
              Simple, surprising, and endlessly fun!
              <br />
              <br />
              Minimum number of players: 3. The more the merrier!
            </div>
            <button
              className="button"
              onClick={() => setShowHowToDialog(false)}
            >
              Okay, sounds fun!
            </button>
          </HowToDialogContent>
        </Scrollable>
      </Dialog>
      <button
        className="button button-red"
        onClick={() => setShowHowToDialog(true)}
      >
        How to play?
      </button>
    </>
  );
};

export default HowToButtonAndDialog;

const HowToDialogContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  .HowToDialogContent-text {
    font-size: calc(14px + 2vmin);
    margin: 0 2vmin;
  }
`;
