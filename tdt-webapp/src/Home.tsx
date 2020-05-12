import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import { toggleToFullscreenAndLandscapeOnMobile } from "./helpers";
import BigLogoScreen from "./BigLogoScreen";
import "./Home.css";

const Home = (props: RouteComponentProps) => {
  const handleStartNewGame = () => {
    navigate("/new");
    toggleToFullscreenAndLandscapeOnMobile();
  };

  return (
    <BigLogoScreen>
      <div className="Home-buttons">
        <button className="button" onClick={handleStartNewGame}>
          Start new game
        </button>
      </div>
    </BigLogoScreen>
  );
};

export default Home;
