import React from "react";

const NewlineToBreak = (text: string) => {
  return text.split("\n").map((item, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key -- lines have no unique id; text content can repeat
    <React.Fragment key={index}>
      {item}
      <br />
    </React.Fragment>
  ));
};

export default NewlineToBreak;
