import React from "react";

const Face = ({ face, small }: { face: string; small: boolean }) => {
  const className = small ? "Face Face-small" : "Face";

  return <div className={className}>{face}</div>;
};

export default Face;
