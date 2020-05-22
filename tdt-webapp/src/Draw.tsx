import React from "react";

import { toggleToFullscreenAndLandscapeOnMobile } from "./helpers";
import { PlayerInfo, Brush } from "./model";

import { ConfirmDrawingDialog, DrawHelpDialog } from "./DrawDialogs";
import DrawCanvas, { ImageProvider } from "./DrawCanvas";
import DrawTools from "./DrawTools";

import "./Draw.css";

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

  const handleCloseHelpDialog = () => {
    setShowHelpDialog(false);
    setFirstTimeHelpDialog(false);
    toggleToFullscreenAndLandscapeOnMobile();
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
        handleClose={handleCloseHelpDialog}
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
