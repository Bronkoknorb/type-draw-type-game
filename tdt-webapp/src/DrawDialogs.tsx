import styled from "styled-components";

import { NewlineToBreak } from "./helpers";
import { PlayerInfo } from "./model";
import Dialog from "./Dialog";
import Scrollable from "./Scrollable";

import drawImg from "./img/draw.svg";

export const ConfirmDrawingDialog = ({
  text,
  show,
  drawingDataUrl,
  handleDone,
  handleContinue,
}: {
  text: string;
  show: boolean;
  drawingDataUrl?: string;
  handleDone: () => void;
  handleContinue: () => void;
}) => {
  return (
    <Dialog show={show}>
      <ConfirmDrawingDialogContent>
        <h1>Are you finished with your drawing?</h1>
        <Text className="ConfirmDrawingDialogContent-text">
          {NewlineToBreak(text)}
        </Text>
        <div>
          <img src={drawingDataUrl} alt="Drawing" />
        </div>
        <div className="buttons">
          <button className="button" onClick={handleDone}>
            Yes, I'm done
          </button>
          <button className="button button-red" onClick={handleContinue}>
            No, continue drawing
          </button>
        </div>
      </ConfirmDrawingDialogContent>
    </Dialog>
  );
};

const ConfirmDrawingDialogContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  img {
    border: 0.7vmin solid black;
    border-radius: 2vmin;
    max-height: 50vh;
    max-width: 80%;
  }

  .ConfirmDrawingDialogContent-text {
    flex-shrink: 1;
    max-height: fit-content;
  }
`;

export const DrawHelpDialog = ({
  text,
  textWriter,
  round,
  rounds,
  show,
  firstShow,
  handleClose,
}: {
  text: string;
  textWriter: PlayerInfo;
  round: number;
  rounds: number;
  show: boolean;
  firstShow: boolean;
  handleClose: () => void;
}) => {
  return (
    <Dialog show={show}>
      <Scrollable>
        <div className="DrawHelp">
          <div>
            <div className="small">
              Round {round} of {rounds}
            </div>
            <h1>
              <img src={drawImg} alt="Draw" />
            </h1>
            <div>... this text by {textWriter.name}:</div>
          </div>
          <Text>{NewlineToBreak(text)}</Text>
          <button className="button" onClick={handleClose}>
            Okay, {firstShow ? "start" : "continue"} drawing
          </button>
        </div>
      </Scrollable>
    </Dialog>
  );
};

const Text = styled.div`
  border-radius: 2vmin;
  padding: 1vmin 2vmin;
  background-color: #def5ff;
  width: 90%;
  box-shadow: 0 0 1vmin #def5ff;
  margin: 2vmin 0;
  word-break: break-word;
  overflow-wrap: anywhere;
  overflow: auto;
`;
