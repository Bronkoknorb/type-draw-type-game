import React from 'react';
import { Link, RouteComponentProps, Router } from "@reach/router";

import logo from './logo.svg';
import './App.css';

import o9n from 'o9n';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Home path="/" />
        <Game path="/g" />{/* TODO https://reach.tech/router/typescript to see how to add parameters */}
      </Router>
    </div>
  );
}

export default App;

const Home = (props: RouteComponentProps) => {
  function isMobileDevice() {
    return window.orientation !== undefined;
  }

  function toggleToFullscreenAndLandscapeOnMobile() {
    if (isMobileDevice()) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          o9n.orientation.lock("landscape-primary").catch(() => console.log("Cannot change orientation"));
        }).catch(() => console.log("Cannot switch to fullscreen"));
      }
    }
  }

  const handleClick = () => toggleToFullscreenAndLandscapeOnMobile();

  return (
    <div>
      <img src={logo} alt="Type Draw Type Game" onClick={handleClick} /><br />
      <Link to="/g">Start new game</Link>
    </div>
  );
};

const Game = (props: RouteComponentProps) => {

  React.useEffect(() => {
    const wsProtocol = (window.location.protocol === "https:") ? "wss://" : "ws://";
    const wsUrl = wsProtocol + window.location.host + "/api/websocket";
    console.log("Connecting to websocket " + wsUrl);
    const socket = new WebSocket(wsUrl);

    // TODO subscribe to messages

    return () => {
      console.log("Disconnecting from websocket");
      socket.close();
    };
  }, []);

  return (
    <Draw />
  );
}

const Draw = () => {
  function getMousePos(canvas: HTMLCanvasElement, event: { clientX: number, clientY: number }) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

  let pos: { x: number, y: number } | null = null;

  function paint_start(ctx: CanvasRenderingContext2D, x: number, y: number) {
    pos = { x, y };
  }
  function paint_move(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (pos === null) {
      paint_start(ctx, x, y);
    }
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(pos!.x, pos!.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    pos = { x, y };
  }
  function paint_end(ctx: CanvasRenderingContext2D, x: number | null = null, y: number | null = null) {
    if (pos === null) {
      return;
    }
    paint_move(ctx, x === null ? pos.x : x, y === null ? pos.y : y);
    pos = null;
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (event.buttons !== 1) {
      return;
    }
    const canvas = event.currentTarget;
    const { x, y } = getMousePos(canvas, event);
    const ctx = canvas.getContext("2d")!;
    paint_start(ctx, x, y);
  };
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = event.currentTarget;
    const { x, y } = getMousePos(canvas, event);
    const ctx = canvas.getContext("2d")!;
    if (event.buttons !== 1) {
      paint_end(ctx);
      return;
    }
    paint_move(ctx, x, y);
  };
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    paint_end(ctx);
  };
  const handleMouseOut = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getMousePos(canvas, event);
    paint_end(ctx, x, y);
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length !== 1) {
      return;
    }
    const canvas = event.currentTarget;
    const { x, y } = getMousePos(canvas, event.touches[0]);
    const ctx = canvas.getContext("2d")!;
    paint_start(ctx, x, y);
  }
  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    if (event.touches.length !== 1) {
      paint_end(ctx);
      return;
    }
    const { x, y } = getMousePos(canvas, event.touches[0]);
    paint_move(ctx, x, y);
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    paint_end(ctx);
  };

  return (<canvas width="1440" height="1080"
    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseOut={handleMouseOut}
    onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}></canvas>);
};