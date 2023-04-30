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
              <strong>Type Draw Type</strong> is a simple and fun game for you
              and your friends. It is like the telephone game (Chinese
              whispers), only with pictures. Every player starts by{" "}
              <strong>typing</strong> a sentence. Then the texts are passed on
              and you have to <strong>draw</strong> the sentence you received.
              In the next round you get one of the drawings and have to describe
              it with another sentence (without knowing the initial sentence!).
              This goes on, by alternately typing and drawing, until all players
              have participated in every chain (story). In the end everybody
              sees all the stories and can wonder about how the initial
              sentences have transformed in unexpected ways!
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
