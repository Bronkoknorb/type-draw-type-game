import React from "react";
import styled from "styled-components";

import { getRandomCharacterFromString } from "./helpers";
import Logo from "./Logo";

import "./BigLogoScreen.css";

const BigLogoScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledBigLogoScreen>
      <BigLogoScreenContent>
        <BigLogoScreenContentHeader>
          <Decoration chars="AFGHJKLMNOPRSTUVWXYZ" />
          <Logo />
          <Decoration chars="abcefghijklmnopqrstu" />
        </BigLogoScreenContentHeader>
        <div>{children}</div>
      </BigLogoScreenContent>
      <Footer>
        <div>
          <a href="https://github.com/Bronkoknorb/type-draw-type-game">
            Open Source
          </a>{" "}
          by Hermann Czedik-Eysenberg
        </div>
      </Footer>
    </StyledBigLogoScreen>
  );
};

const StyledBigLogoScreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BigLogoScreenContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const BigLogoScreenContentHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  .Decoration:first-of-type {
    margin-top: 21vmin;
  }

  .Decoration:last-of-type {
    margin-bottom: 21vmin;
  }
`;

const Footer = styled.div`
  font-size: 14px;
  text-align: right;
  padding-right: 1vw;
  padding-bottom: 1vw;
`;

const Decoration = ({ chars }: { chars: string }) => {
  const getRandomDecorationChar = () => getRandomCharacterFromString(chars);

  const [decorationChar, setDecorationChar] = React.useState(
    getRandomDecorationChar
  );

  const nextDecoration = () => {
    setDecorationChar(getRandomDecorationChar());
  };

  return (
    <div className="Decoration " onClick={nextDecoration}>
      {decorationChar}
    </div>
  );
};

export default BigLogoScreen;
