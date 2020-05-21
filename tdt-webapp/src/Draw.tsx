import React from "react";
import styled from "styled-components/macro";
import { useWindowSize, getCanvasSize, NewlineToBreak } from "./helpers";
import Dialog from "./Dialog";
import "./Draw.css";
import colorwheelImg from "./img/colorwheel.svg";
import drawImg from "./img/draw.svg";
import helpImg from "./img/help.svg";
import checkImg from "./img/check.svg";
import { PlayerInfo } from "./model";
import Scrollable from "./Scrollable";

interface Brush {
  pixelSize: number;
  displaySize: number;
}

function getBrushes(scale: number): Brush[] {
  const sizes = [2, 8, 16, 32, 64];
  return sizes.map((size) => ({
    pixelSize: size,
    displaySize: Math.ceil(size * scale),
  }));
}

const Text = styled.div`
  border-radius: 2vmin;
  padding: 1vmin 2vmin;
  background-color: #def5ff;
  width: 90%;
  box-shadow: 0 0 1vmin #def5ff;
  margin: 2vmin 0;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const Draw = ({
  text,
  textWriter,
  round,
  rounds,
  handleDone,
}: {
  text: string;
  textWriter: PlayerInfo;
  round: number;
  rounds: number;
  handleDone: (image: Blob) => void;
}) => {
  const [showHelpDialog, setShowHelpDialog] = React.useState(true);
  const [firstTimeHelpDialog, setFirstTimeHelpDialog] = React.useState(true);

  const [color, setColor] = React.useState("#000");

  const [brushSizes, setBrushSizes] = React.useState(() => getBrushes(1));

  const [selectedBrushIndex, setSelectedBrushIndex] = React.useState(1);

  const selectedBrush: Brush = brushSizes[selectedBrushIndex];

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

  const handlePickColor = (newColor: string) => {
    setColor(newColor);
    setShowColorPicker(false);
  };

  const handleSetBrush = (brushIndex: number) => {
    setShowBrushPopup(false);
    setSelectedBrushIndex(brushIndex);
  };

  const handleScaleChange = React.useCallback((scale: number) => {
    setBrushSizes(getBrushes(scale));
  }, []);

  const imageProviderRef = React.useRef<ImageProvider>();

  const handleClickDone = () => {
    const imageProvider = imageProviderRef.current!;
    const imageDataUrl = imageProvider.getImageDataURL();
    // nice trick using fetch to get the image as binary Blob instead of data url
    window
      .fetch(imageDataUrl)
      .then((res) => res.blob())
      .then((image) => handleDone(image));
  };

  return (
    <div className="Draw">
      <Dialog show={showHelpDialog}>
        <Scrollable>
          <div className="DrawHelp">
            <div>
              <div className="small">
                Round {round} of {rounds}
              </div>
              <h1>
                <img src={drawImg} alt="Draw" />
              </h1>
              {
                // TODO add avatar
              }
              <div>... this text by {textWriter.name}:</div>
            </div>
            <Text>{NewlineToBreak(text)}</Text>
            <button
              className="button"
              onClick={() => {
                setShowHelpDialog(false);
                setFirstTimeHelpDialog(false);
              }}
            >
              Okay, {firstTimeHelpDialog ? "start" : "continue"} drawing
            </button>
          </div>
        </Scrollable>
      </Dialog>
      <div className="Draw-tools">
        <div
          className="tool-button tool-button-help"
          onClick={() => setShowHelpDialog(true)}
        >
          <img src={helpImg} alt="Help" title="Help (Show text to draw)" />
        </div>
        <BrushButton
          size={selectedBrush.displaySize}
          color={color}
          onClick={selectBrush}
          ref={brushButton}
        />
        <div
          className={"tool-popup" + (showBrushPopup ? "" : " hidden")}
          ref={brushPopup}
        >
          {brushSizes.map((brush, index) => (
            <BrushButton
              key={index}
              size={brush.displaySize}
              color={color}
              onClick={() => handleSetBrush(index)}
            />
          ))}
        </div>
        <div className="tool-color" onClick={triggerColorPicker}>
          <div
            className="tool-color-selectedcolor"
            style={{ backgroundColor: color }}
          ></div>
          <img src={colorwheelImg} alt="Pick color" title="Pick color" />
        </div>
        <Dialog show={showColorPicker}>
          <ColorPicker handlePickColor={handlePickColor} />
        </Dialog>
        <div className="tool-button tool-button-done" onClick={handleClickDone}>
          <img src={checkImg} alt="Done" title="Done" />
        </div>
      </div>
      <DrawCanvas
        color={color}
        brushPixelSize={selectedBrush.pixelSize}
        imageProviderRef={imageProviderRef}
        handleScaleChange={handleScaleChange}
      />
    </div>
  );
};

export default Draw;

const BrushButton = React.forwardRef(
  (
    {
      color,
      size,
      onClick,
    }: {
      color: string;
      size: number;
      onClick: () => void;
    },
    ref?: React.Ref<HTMLDivElement>
  ) => {
    return (
      <div
        className="tool-button tool-button-brush"
        onClick={onClick}
        ref={ref}
        style={{ backgroundColor: color === "#FFF" ? "#aaa" : "white" }}
      >
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        ></div>
      </div>
    );
  }
);

interface ImageProvider {
  getImageDataURL: () => string;
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

  return { x, y };
}

const DrawCanvas = ({
  color,
  brushPixelSize,
  imageProviderRef,
  handleScaleChange,
}: {
  color: string;
  brushPixelSize: number;
  imageProviderRef: React.MutableRefObject<ImageProvider | undefined>;
  handleScaleChange: (scale: number) => void;
}) => {
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);

  const canvasRefCallback = React.useCallback(
    (canvasElement: HTMLCanvasElement | null) => {
      if (canvasElement !== null) {
        setCanvas(canvasElement);
        imageProviderRef.current = {
          getImageDataURL: () => canvasElement.toDataURL("image/png"),
        };
      }
    },
    [imageProviderRef]
  );

  const windowSize = useWindowSize();

  React.useEffect(() => {
    if (canvas !== null) {
      const canvasSize = getCanvasSize(canvas);
      const scale = canvasSize.width / canvas.width;
      handleScaleChange(scale);
    }
  }, [canvas, windowSize, handleScaleChange]);

  const clearCanvas = () => {
    if (canvas === null) return;
    const ctx = getCanvas2DContext(canvas);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // initial clear
  React.useEffect(clearCanvas, [canvas]);

  let pos: { x: number; y: number } | null = null;

  function paint_start(ctx: CanvasRenderingContext2D, x: number, y: number) {
    pos = { x, y };
  }
  function paint_move(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (pos === null) {
      paint_start(ctx, x, y);
    }
    ctx.lineCap = "round";
    ctx.lineWidth = brushPixelSize;
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
    const canvasTarget = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvasTarget, event);
    const ctx = getCanvas2DContext(canvasTarget);
    paint_start(ctx, x, y);
  };
  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvasTarget = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvasTarget, event);
    const ctx = getCanvas2DContext(canvasTarget);
    if (event.buttons !== 1) {
      paint_end(ctx);
      return;
    }
    paint_move(ctx, x, y);
  };
  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvasTarget = event.currentTarget;
    const ctx = getCanvas2DContext(canvasTarget);
    paint_end(ctx);
  };
  const handleMouseOut = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvasTarget = event.currentTarget;
    const ctx = getCanvas2DContext(canvasTarget);
    const { x, y } = getPositionInCanvas(canvasTarget, event);
    paint_end(ctx, x, y);
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length !== 1) {
      return;
    }
    const canvasTarget = event.currentTarget;
    const { x, y } = getPositionInCanvas(canvasTarget, event.touches[0]);
    const ctx = getCanvas2DContext(canvasTarget);
    paint_start(ctx, x, y);
  };
  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvasTarget = event.currentTarget;
    const ctx = getCanvas2DContext(canvasTarget);
    if (event.touches.length !== 1) {
      paint_end(ctx);
      return;
    }
    const { x, y } = getPositionInCanvas(canvasTarget, event.touches[0]);
    paint_move(ctx, x, y);
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvasTarget = event.currentTarget;
    const ctx = getCanvas2DContext(canvasTarget);
    paint_end(ctx);
  };

  return (
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
        ref={canvasRefCallback}
      ></canvas>
    </div>
  );
};

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
      {colors.map((colorRow, index) => (
        <div key={index}>
          {colorRow.map((color, indexInner) => {
            const style = {
              backgroundColor: color,
            };
            return (
              <div
                key={indexInner}
                style={style}
                onClick={() => handlePickColor(color)}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

function getCanvas2DContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  return canvas.getContext("2d")!;
}
