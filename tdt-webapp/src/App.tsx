import React from "react";
import { RouteComponentProps, Router, navigate } from "@reach/router";
import { v4 as uuidv4 } from "uuid";

import logo from "./logo.svg";
import "./App.css";

import o9n from "o9n";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Home path="/" default />
        <Game path="/g/:gameId" />
      </Router>
    </div>
  );
};

export default App;

function isMobileDevice() {
  return window.orientation !== undefined;
}

function toggleToFullscreenAndLandscapeOnMobile() {
  if (isMobileDevice()) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          o9n.orientation
            .lock("landscape-primary")
            .catch(() => console.log("Cannot change orientation"));
        })
        .catch(() => console.log("Cannot switch to fullscreen"));
    }
  }
}

const Home = (props: RouteComponentProps) => {
  const handleStartNewGame = () => {
    navigate("/g/xyz"); // TODO game id
    toggleToFullscreenAndLandscapeOnMobile();
  };

  return (
    <div className="Home">
      <div className="Home-content">
        <div className="Home-header">
          <Drawing className="Drawing-left" chars="AFGHJKLMNOPRSTUVWXYZ" />
          <Logo />
          <Drawing className="Drawing-right" chars="abcefghijklmnopqrstu" />
        </div>
        <div className="Home-buttons">
          <button className="button" onClick={handleStartNewGame}>
            Start new game
          </button>
        </div>
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

const Logo = () => (
  <div className="Logo">
    <img
      src={logo}
      alt="Type Draw Type Game"
      onClick={toggleToFullscreenAndLandscapeOnMobile}
    />
  </div>
);

function getRandomCharacterFromString(s: string) {
  return s.charAt(Math.floor(Math.random() * s.length));
}

const Drawing = ({
  chars,
  className,
}: {
  chars: string;
  className: string;
}) => {
  const getRandomDrawingChar = () => getRandomCharacterFromString(chars);

  const [drawingChar, setDrawingChar] = React.useState(getRandomDrawingChar);

  const nextDrawing = () => {
    setDrawingChar(getRandomDrawingChar());
  };

  return (
    <div className={"Drawing " + className} onClick={nextDrawing}>
      {drawingChar}
    </div>
  );
};

interface GameProps extends RouteComponentProps {
  gameId?: string;
}

const Game = (props: GameProps) => {
  let gameId = props.gameId;

  function getUserId() {
    const store = window.localStorage;
    let userId = store.getItem("userId");
    if (userId === null) {
      userId = uuidv4();
      store.setItem("userId", userId);
    }
    return userId;
  }

  React.useEffect(() => {
    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = wsProtocol + window.location.host + "/api/websocket";
    console.log("Connecting to websocket " + wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", (event) => {
      console.log("Websocket opened. Sending join action.");

      socket.send(
        JSON.stringify({
          action: "join",
          join: {
            gameId,
            userId: getUserId(),
          },
        })
      );
    });

    return () => {
      console.log("Disconnecting from websocket");
      socket.close();
    };
  }, [gameId]);

  // TODO
  if (true) {
    return <Draw />;
  } else {
    return <Join />;
  }
};

const Join = () => {
  const [avatar, setAvatar] = React.useState("");

  const [name, setName] = React.useState("");

  const buttonDisabled = name === "";

  return (
    <div className="Join">
      <div className="Join-logo">
        <Logo />
      </div>
      <div className="Join-content">
        Click to pick your look:
        <br />
        <Avatar handleChange={(face) => setAvatar(face)} />
        <label htmlFor="name">Enter your name:</label>
        <input
          type="text"
          id="name"
          name="name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <br />
        <button className="button" disabled={buttonDisabled}>
          Join game
        </button>
      </div>
    </div>
  );
};

const Avatar = ({ handleChange }: { handleChange: (face: string) => void }) => {
  const faces = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const [face, setFace] = React.useState(() => {
    const initialFace = getRandomCharacterFromString(faces);
    handleChange(initialFace);
    return initialFace;
  });

  const nextFace = () => {
    const newFace = faces.charAt((faces.indexOf(face) + 1) % faces.length);
    handleChange(newFace);
    setFace(newFace);
  };

  return (
    <div className="Avatar" onClick={nextFace}>
      {face}
    </div>
  );
};

const Draw = () => {
  // calculates size and position of img/canvas with css object-fit: contain
  function getObjectFitSize(
    containerWidth: number,
    containerHeight: number,
    width: number,
    height: number
  ) {
    const doRatio = width / height;
    const cRatio = containerWidth / containerHeight;
    let targetWidth = 0;
    let targetHeight = 0;

    if (doRatio > cRatio) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }

    return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2,
    };
  }

  function getCanvasSize(canvas: HTMLCanvasElement) {
    return getObjectFitSize(
      canvas.clientWidth,
      canvas.clientHeight,
      canvas.width,
      canvas.height
    );
  }

  // gets position in "natural" canvas coordinates for mouse/touch events
  function getPositionInCanvas(
    canvas: HTMLCanvasElement,
    event: { clientX: number; clientY: number }
  ) {
    const rect = canvas.getBoundingClientRect();

    const canvasSize = getCanvasSize(canvas);

    const scaleX = canvas.width / canvasSize.width;
    const scaleY = canvas.height / canvasSize.height;

    const x = (event.clientX - rect.left - canvasSize.x) * scaleX;
    const y = (event.clientY - rect.top - canvasSize.y) * scaleY;

    return {
      x: x,
      y: y,
    };
  }

  let pos: { x: number; y: number } | null = null;

  function paint_start(ctx: CanvasRenderingContext2D, x: number, y: number) {
    pos = { x, y };
  }
  function paint_move(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (pos === null) {
      paint_start(ctx, x, y);
    }
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(pos!.x, pos!.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    pos = { x, y };
  }
  function paint_end(
    ctx: CanvasRenderingContext2D,
    x: number | null = null,
    y: number | null = null
  ) {
    if (pos === null) {
      return;
    }
    paint_move(ctx, x === null ? pos.x : x, y === null ? pos.y : y);
    pos = null;
  }

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (event.buttons !== 1) {
      return;
    }
    const canvas = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvas, event);
    const ctx = canvas.getContext("2d")!;
    paint_start(ctx, x, y);
  };
  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvas, event);
    const ctx = canvas.getContext("2d")!;
    if (event.buttons !== 1) {
      paint_end(ctx);
      return;
    }
    paint_move(ctx, x, y);
  };
  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    paint_end(ctx);
  };
  const handleMouseOut = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPositionInCanvas(canvas, event);
    paint_end(ctx, x, y);
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length !== 1) {
      return;
    }
    const canvas = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvas, event.touches[0]);
    const ctx = canvas.getContext("2d")!;
    paint_start(ctx, x, y);
  };
  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    if (event.touches.length !== 1) {
      paint_end(ctx);
      return;
    }
    const { x, y } = getPositionInCanvas(canvas, event.touches[0]);
    paint_move(ctx, x, y);
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d")!;
    paint_end(ctx);
  };

  const [showBrushPopup, setShowBrushPopup] = React.useState(false);

  const brushPopup = React.createRef<HTMLDivElement>();

  const selectBrush = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (brushPopup.current !== null) {
      const button = event.currentTarget;
      brushPopup.current.style.left =
        button.offsetLeft + button.offsetWidth + "px";
      brushPopup.current.style.top = button.offsetTop + "px";
      setShowBrushPopup(!showBrushPopup);
    }
  };

  const canvasRef = React.createRef<HTMLCanvasElement>();

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // initial clear
  React.useEffect(clearCanvas, []);

  return (
    <div className="Draw">
      <div className="Draw-tools">
        <div className="tool-button" onClick={selectBrush}>
          <div>Brush</div>
        </div>
        <div className="tool-button">
          <div>Info</div>
        </div>
        <div
          className={"tool-popup" + (showBrushPopup ? "" : " hidden")}
          ref={brushPopup}
        >
          Brushes
        </div>
        <div className="tool-button">
          <div>Done</div>
        </div>
      </div>
      <div className="Draw-canvas">
        <canvas
          width="1440"
          height="1080"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseOut}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  );
};
