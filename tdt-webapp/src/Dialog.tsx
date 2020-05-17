import React from "react";
import styled from "styled-components/macro";

const Dialog = ({
  show,
  children,
  highPriority = false,
}: {
  show: boolean;
  children: React.ReactNode;
  highPriority?: boolean;
}) => {
  if (!show) return null;

  return (
    <StyledDialog highPriority={highPriority}>
      <DialogContent>{children}</DialogContent>
    </StyledDialog>
  );
};

export default Dialog;

const StyledDialog = styled.div<{ highPriority: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: ${(props) => (props.highPriority ? 20 : 10)};
`;

const DialogContent = styled.div`
  width: 90vw;
  height: 90vh;
  border: 0.7vmin solid black;
  border-radius: 4vmin;
  background-color: white;
  box-shadow: 0.5vmin 0.7vmin 1vmin rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;
