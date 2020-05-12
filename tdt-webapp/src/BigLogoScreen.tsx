import React from "react";
import { getRandomCharacterFromString } from "./helpers";
import Logo from "./Logo";

// TODO: CSS class names here do not fit to component name

const BigLogoScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="Home">
      <div className="Home-content">
        <div className="Home-header">
          <Decoration
            className="Decoration-left"
            chars="AFGHJKLMNOPRSTUVWXYZ"
          />
          <Logo />
          <Decoration
            className="Decoration-right"
            chars="abcefghijklmnopqrstu"
          />
        </div>
        <div className="Home-main">{children}</div>
      </div>
      <div className="Home-footer">
        <div>
          <a href="https://github.com/Bronkoknorb/type-draw-type-game">
            Open Source
          </a>{" "}
          by Hermann Czedik-Eysenberg
        </div>
      </div>
    </div>
  );
};

const Decoration = ({
  chars,
  className,
}: {
  chars: string;
  className: string;
}) => {
  const getRandomDecorationChar = () => getRandomCharacterFromString(chars);

  const [decorationChar, setDecorationChar] = React.useState(
    getRandomDecorationChar
  );

  const nextDecoration = () => {
    setDecorationChar(getRandomDecorationChar());
  };

  return (
    <div className={"Decoration " + className} onClick={nextDecoration}>
      {decorationChar}
    </div>
  );
};

export default BigLogoScreen;
