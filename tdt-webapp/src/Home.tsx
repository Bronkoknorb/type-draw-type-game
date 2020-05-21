import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { toggleToFullscreenAndLandscapeOnMobile } from "./helpers";
import BigLogoScreen from "./BigLogoScreen";

const Home = (props: RouteComponentProps) => {
  const handleStartNewGame = () => {
    navigate("/new");
    toggleToFullscreenAndLandscapeOnMobile();
  };

  // TODO add button to Join existing game.
  // TODO add game description

  return (
    <BigLogoScreen>
      <div className="buttons">
        <button className="button" onClick={handleStartNewGame}>
          Start new game
        </button>
      </div>
    </BigLogoScreen>
  );
};

export default Home;
