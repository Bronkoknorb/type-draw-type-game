import React from 'react';
import logo from './logo.svg';
import './App.css';

import o9n from 'o9n';

function App() {

  function isMobileDevice() {
    return (window.orientation !== undefined && document.documentElement.requestFullscreen !== undefined);
  };

  function toggleToFullscreenAndLandscapeOnMobile() {
    if (isMobileDevice()) {
      document.documentElement.requestFullscreen().then(() => {
        o9n.orientation.lock("landscape-primary");
      });
    }
  }

  const handleClick = () => toggleToFullscreenAndLandscapeOnMobile();

  function getMousePos(canvas: HTMLCanvasElement, event: React.MouseEvent) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

  let pos: { x: number, y: number } | null = null;

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (event.buttons !== 1) {
      pos = null;
      return;
    }
    const canvas = event.currentTarget;
    const { x, y } = getMousePos(canvas, event);
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.beginPath();
    if (pos === null)
      pos = { x, y };
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    pos = { x, y };
  };
  const handleMouseOut = () => {
    pos = null;
  }

  // TODO touch events: check how I did it for Rufbot

  return (
    <div className="App">
      <header className="App-header">
        <canvas width="600" height="600" onMouseDown={handleMouseMove} onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}></canvas>
        <button onClick={handleClick}>
          To Fullscreen
        </button>
      </header>
    </div>
  );
}

export default App;
