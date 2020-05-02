import React from "react";

import { useWindowSize, getCanvasSize } from "./helpers";
import Dialog from "./Dialog";

import colorwheel from "./colorwheel.svg";

const Draw = () => {
  const [color, setColor] = React.useState("#000");

  interface Brush {
    pixelSize: number;
    displaySize: number;
  }

  const getBrushSizes: (scale: number) => Brush[] = (scale: number) => {
    const sizes = [2, 8, 16, 32, 64];
    return sizes.map((size) => ({
      pixelSize: size,
      displaySize: Math.ceil(size * scale),
    }));
  };

  const [brushSizes, setBrushSizes] = React.useState(() => getBrushSizes(1));

  const [selectedBrushIndex, setSelectedBrushIndex] = React.useState(1);

  const selectedBrush: Brush = brushSizes[selectedBrushIndex];

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
    ctx.lineWidth = selectedBrush.pixelSize;
    ctx.strokeStyle = color;
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

  const brushButton = React.useRef<HTMLDivElement>(null);
  const brushPopup = React.useRef<HTMLDivElement>(null);

  const selectBrush = () => {
    setShowBrushPopup(!showBrushPopup);
  };

  const windowSize = useWindowSize();

  React.useEffect(() => {
    const setBrushPopupPosition = () => {
      if (brushPopup.current !== null && brushButton.current !== null) {
        brushPopup.current.style.left = `${
          brushButton.current.offsetLeft + brushButton.current.offsetWidth
        }px`;
        brushPopup.current.style.top = `calc(${brushButton.current.offsetTop}px - 2vmin)`;
      }
    };

    setBrushPopupPosition();
  }, [windowSize, brushButton, brushPopup]);

  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const triggerColorPicker = () => {
    setShowColorPicker(true);
  };

  const handlePickColor = (color: string) => {
    setColor(color);
    setShowColorPicker(false);
  };

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // initial clear
  React.useEffect(clearCanvas, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas !== null) {
      const canvasSize = getCanvasSize(canvas);
      const scale = canvasSize.width / canvas.width;
      setBrushSizes(getBrushSizes(scale));
    }
  }, [windowSize]);

  const handleSetBrush = (brush: Brush) => {
    setShowBrushPopup(false);
    setSelectedBrushIndex(brushSizes.indexOf(brush));
  };

  return (
    <div className="Draw">
      <div className="Draw-tools">
        <div className="tool-button tool-button-info">
          <div>Info</div>
        </div>
        <div
          className="tool-button tool-button-brush"
          onClick={selectBrush}
          ref={brushButton}
        >
          <div
            style={{
              width: selectedBrush.displaySize,
              height: selectedBrush.displaySize,
              backgroundColor: color,
            }}
          ></div>
        </div>
        <div
          className={"tool-popup" + (showBrushPopup ? "" : " hidden")}
          ref={brushPopup}
        >
          {brushSizes.map((brush) => (
            <div
              className="tool-button tool-button-brush"
              onClick={() => handleSetBrush(brush)}
              key={brush.pixelSize}
            >
              <div
                style={{
                  width: brush.displaySize,
                  height: brush.displaySize,
                  backgroundColor: color,
                }}
              ></div>
            </div>
          ))}
        </div>
        <div className="tool-color" onClick={triggerColorPicker}>
          <div
            className="tool-color-selectedcolor"
            style={{ backgroundColor: color }}
          ></div>
          <img src={colorwheel} alt="Pick color" title="Pick color" />
        </div>
        <Dialog show={showColorPicker}>
          <ColorPicker handlePickColor={handlePickColor} />
        </Dialog>
        <div className="button tool-button-done">
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

export default Draw;

const ColorPicker = ({
  handlePickColor,
}: {
  handlePickColor: (color: string) => void;
}) => {
  const colors = [
    ["#FFF", "#DDD", "#AAA", "#555", "#000"],
    ["#FAA", "#F55", "#F00", "#A00", "#500"],
    ["#FDA", "#FA5", "#F80", "#A50", "#520"],
    ["#FFA", "#FF5", "#FF0", "#AA0", "#550"],
    ["#AFA", "#5F5", "#0F0", "#0A0", "#050"],
    ["#AFD", "#5FA", "#0F8", "#0A5", "#052"],
    ["#AFF", "#5FF", "#0FF", "#0AA", "#055"],
    ["#ADF", "#5AF", "#08F", "#05A", "#025"],
    ["#AAF", "#55F", "#00F", "#00A", "#005"],
    ["#DAF", "#A5F", "#80F", "#50A", "#205"],
    ["#FAF", "#F5F", "#F0F", "#A0A", "#505"],
  ];

  return (
    <div className="ColorPicker">
      {colors.map((colorRow) => (
        <div>
          {colorRow.map((color) => {
            const style = {
              backgroundColor: color,
            };
            return (
              <div style={style} onClick={() => handlePickColor(color)}></div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
