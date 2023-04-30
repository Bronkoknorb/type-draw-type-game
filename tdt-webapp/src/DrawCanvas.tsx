import React from "react";
import { useWindowSize, getCanvasSize } from "./helpers";

export interface ImageProvider {
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

  function paint_start(_: CanvasRenderingContext2D, x: number, y: number) {
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

export default DrawCanvas;

function getCanvas2DContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  return canvas.getContext("2d")!;
}
