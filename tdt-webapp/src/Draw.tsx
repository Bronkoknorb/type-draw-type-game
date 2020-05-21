import React from "react";

import { useWindowSize } from "./helpers";
import { PlayerInfo } from "./model";

import Dialog from "./Dialog";
import ColorPicker from "./ColorPicker";
import { ConfirmDrawingDialog, DrawHelpDialog } from "./DrawDialogs";
import DrawCanvas, { ImageProvider } from "./DrawCanvas";

import "./Draw.css";

import helpImg from "./img/help.svg";
import checkImg from "./img/check.svg";
import colorwheelImg from "./img/colorwheel.svg";

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

  const [brushes, setBrushes] = React.useState(() => getBrushes(1));

  const [selectedBrushIndex, setSelectedBrushIndex] = React.useState(1);

  const selectedBrush: Brush = brushes[selectedBrushIndex];

  const handleSelectBrush = (brushIndex: number) => {
    setSelectedBrushIndex(brushIndex);
  };

  const handleScaleChange = React.useCallback((scale: number) => {
    setBrushes(getBrushes(scale));
  }, []);

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [drawingDataUrl, setDrawingDataUrl] = React.useState<
    string | undefined
  >();

  const imageProviderRef = React.useRef<ImageProvider>();

  const handleClickDone = () => {
    const imageProvider = imageProviderRef.current!;
    const imageDataUrl = imageProvider.getImageDataURL();
    setDrawingDataUrl(imageDataUrl);
    setShowConfirmDialog(true);
  };

  const handleConfirmDone = () => {
    // nice trick using fetch to get the image as binary Blob instead of data url
    window
      .fetch(drawingDataUrl!)
      .then((res) => res.blob())
      .then((image) => handleDone(image));
    setShowConfirmDialog(false);
  };

  const handleContinueDrawing = () => {
    setShowConfirmDialog(false);
    setDrawingDataUrl(undefined);
  };

  const handleCloseDrawDialog = () => {
    setShowHelpDialog(false);
    setFirstTimeHelpDialog(false);
  };

  return (
    <div className="Draw">
      <ConfirmDrawingDialog
        text={text}
        show={showConfirmDialog}
        drawingDataUrl={drawingDataUrl}
        handleDone={handleConfirmDone}
        handleContinue={handleContinueDrawing}
      />
      <DrawHelpDialog
        text={text}
        textWriter={textWriter}
        round={round}
        rounds={rounds}
        show={showHelpDialog}
        firstShow={firstTimeHelpDialog}
        handleClose={handleCloseDrawDialog}
      />
      <DrawTools
        color={color}
        brushes={brushes}
        selectedBrush={selectedBrush}
        triggerHelp={() => setShowHelpDialog(true)}
        onSelectBrush={handleSelectBrush}
        onChangeColor={(newColor) => setColor(newColor)}
        onDone={handleClickDone}
      />
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

const DrawTools = ({
  color,
  brushes,
  selectedBrush,
  triggerHelp,
  onSelectBrush,
  onChangeColor,
  onDone,
}: {
  color: string;
  brushes: Brush[];
  selectedBrush: Brush;
  triggerHelp: () => void;
  onSelectBrush: (brushIndex: number) => void;
  onChangeColor: (color: string) => void;
  onDone: () => void;
}) => {
  const brushButton = React.useRef<HTMLDivElement>(null);
  const brushPopup = React.useRef<HTMLDivElement>(null);

  const [showBrushPopup, setShowBrushPopup] = React.useState(false);

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

  const handleSelectBrush = (index: number) => {
    setShowBrushPopup(false);
    onSelectBrush(index);
  };

  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const triggerColorPicker = () => {
    setShowColorPicker(true);
  };

  const handlePickColor = (newColor: string) => {
    onChangeColor(newColor);
    setShowColorPicker(false);
  };

  return (
    <div className="Draw-tools">
      <div className="tool-button tool-button-help" onClick={triggerHelp}>
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
        {brushes.map((brush, index) => (
          <BrushButton
            key={index}
            size={brush.displaySize}
            color={color}
            onClick={() => handleSelectBrush(index)}
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
      <div className="tool-button tool-button-done" onClick={onDone}>
        <img src={checkImg} alt="Done" title="Done" />
      </div>
    </div>
  );
};

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
