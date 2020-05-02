import React from "react";

import o9n from "o9n";

function isMobileDevice() {
  return window.orientation !== undefined;
}

export function toggleToFullscreenAndLandscapeOnMobile() {
  if (isMobileDevice()) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          o9n.orientation
            .lock("landscape-primary")
            .catch(() => console.log("Cannot change orientation"));
        })
        .catch(() => console.log("Cannot switch to fullscreen"));
    }
  }
}

export function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  const [windowSize, setWindowSize] = React.useState(getSize);

  React.useEffect(() => {
    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export function getRandomCharacterFromString(s: string) {
  return s.charAt(Math.floor(Math.random() * s.length));
}

// calculates size and position of img/canvas with css object-fit: contain
function getObjectFitSize(
  containerWidth: number,
  containerHeight: number,
  width: number,
  height: number
) {
  const doRatio = width / height;
  const cRatio = containerWidth / containerHeight;
  let targetWidth = 0;
  let targetHeight = 0;

  if (doRatio > cRatio) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2,
  };
}

export function getCanvasSize(canvas: HTMLCanvasElement) {
  return getObjectFitSize(
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
  );
}
