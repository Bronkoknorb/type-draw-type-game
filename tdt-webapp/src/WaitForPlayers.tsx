import React from "react";
import Player from "./Player";
import Logo from "./Logo";

const WaitForPlayers = ({ gameId }: { gameId: string }) => {
  // TODO should depend on number of players
  const buttonDisabled = false;

  const link = window.location.toString();

  return (
    <div className="WaitForPlayers">
      <div className="WaitForPlayers-left">
        <div className="Players-title">Players:</div>
        <div className="Players">
          <Player face="A">Player1</Player>
          <Player face="B">Player2</Player>
          <Player face="C">Player3</Player>
          <Player face="D">Player4</Player>
          <Player face="E">Player5</Player>
          <Player face="F">Player6</Player>
          <Player face="G">Player7</Player>
          <Player face="H">Player8</Player>
          <Player face="I">Player9</Player>
          <Player face="J">
            Player10xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </Player>
          <Player face="K">
            Player11 with a really really long name name name name name name
            name name name name name name name name name name name name name
            name name name name name name name name name name name name name
            name name name name name name name name name name name name name
            name name name name name
          </Player>
        </div>
      </div>
      <div className="WaitForPlayers-right">
        <Logo />
        <div>Ask your friends to join the game:</div>
        <div>
          <div className="field-label">Game Code:</div>
          <div className="field">{gameId}</div>
        </div>
        <div>
          <div className="field-label">Link:</div>
          <div className="field">{link}</div>
        </div>
        <div className="buttons">
          <button
            className="button"
            disabled={buttonDisabled}
            title={
              buttonDisabled
                ? "Waiting for more players"
                : "Let's get this party started!"
            }
          >
            Start Game
          </button>
          {/*<button className="button button-red">Cancel Game</button>*/}
        </div>
        <div className="small">
          Once the game is started, no more players can join!
        </div>
      </div>
    </div>
  );
};

export default WaitForPlayers;
