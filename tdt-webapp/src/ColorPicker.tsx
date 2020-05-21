import React from "react";

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

export default ColorPicker;
