import React from "react";

const Avatar = ({ face, small }: { face: string; small: boolean }) => {
  const className = small ? "Avatar Avatar-small" : "Avatar";

  return <div className={className}>{face}</div>;
};

export default Avatar;
