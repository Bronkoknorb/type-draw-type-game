import React from "react";
import Avatar from "./Avatar";

const Player = ({
  face,
  children,
}: {
  face: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="Player">
      <Avatar face={face} small={true}></Avatar>
      <div>{children}</div>
    </div>
  );
};

export default Player;
