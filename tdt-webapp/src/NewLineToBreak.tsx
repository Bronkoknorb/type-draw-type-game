import React from "react";

const NewlineToBreak = (text: string) => {
  return text.split("\n").map((item, index) => (
    <React.Fragment key={index}>
      {item}
      <br />
    </React.Fragment>
  ));
};

export default NewlineToBreak;
