import React from "react";

const Dialog = ({
  show,
  children,
}: {
  show: boolean;
  children: JSX.Element;
}) => {
  if (!show) return null;

  return (
    <div className="Dialog">
      <div className="Dialog-content">{children}</div>
    </div>
  );
};

export default Dialog;
