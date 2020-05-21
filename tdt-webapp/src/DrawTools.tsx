import React from "react";

import { useWindowSize } from "./helpers";
import { Brush } from "./model";

import Dialog from "./Dialog";
import ColorPicker from "./ColorPicker";

import helpImg from "./img/help.svg";
import checkImg from "./img/check.svg";
import colorwheelImg from "./img/colorwheel.svg";

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

export default DrawTools;

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
