import { RouteComponentProps, navigate } from "@reach/router";
import styled from "styled-components";

import { toggleToFullscreenAndLandscapeOnMobile } from "./helpers";
import BigLogoScreen from "./BigLogoScreen";
import HowToButtonAndDialog from "./HowToButtonAndDialog";

const Home = (_: RouteComponentProps) => {
  const handleStartNewGame = () => {
    navigate("/new");
    toggleToFullscreenAndLandscapeOnMobile();
  };

  const handleJoinGame = () => {
    navigate("/join");
    toggleToFullscreenAndLandscapeOnMobile();
  };

  return (
    <BigLogoScreen>
      <Buttons>
        <HowToButtonAndDialog />
        <br />
        <button className="button" onClick={handleStartNewGame}>
          Start new Game
        </button>
        <button className="button button-blue" onClick={handleJoinGame}>
          Join Game
        </button>
      </Buttons>
    </BigLogoScreen>
  );
};

export default Home;

const Buttons = styled.div`
  .button {
    margin: 1.5vmin;
  }
`;
