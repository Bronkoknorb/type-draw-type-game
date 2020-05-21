import React from "react";
import Face from "./Face";

const Player = ({
  face,
  children,
}: {
  face: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="Player">
      <Face face={face} small={true}></Face>
      <div>{children}</div>
    </div>
  );
};

export default Player;
