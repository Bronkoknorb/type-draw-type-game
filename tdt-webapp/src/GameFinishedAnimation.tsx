import React from "react";
import styled from "styled-components";
import { useWindowSize } from "./helpers";

const GameFinishedAnimation = ({
  handleShowStories,
}: {
  handleShowStories: () => void;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationClickRef =
    React.useRef<
      (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    >();

  const windowSize = useWindowSize();

  React.useEffect(() => {
    // inspired by https://codepen.io/deanwagman/pen/EjLBdQ

    let run = true;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    const config = {
      particleNumber: 50,
      minParticleSize: 5,
      maxParticleSize: 15,
      maxSpeed: 10,
      maxTimeBetweenExplosionsMillis: 5000,
    };

    interface Color {
      r: number;
      g: number;
      b: number;
    }

    const colors: Color[] = [
      { r: 255, g: 10, b: 10 },
      { r: 53, g: 84, b: 255 },
      { r: 0, g: 233, b: 0 },
      { r: 255, g: 170, b: 85 },
      { r: 255, g: 0, b: 255 },
      { r: 255, g: 255, b: 0 },
    ];

    let particles: Particle[] = [];

    const drawBackground = () => {
      ctx.fillStyle = "#ffffbe";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    class Particle {
      x: number;
      y: number;
      radius: number;
      color: Color;
      speed: number;
      direction: number;
      constructor(x?: number, y?: number) {
        this.x = x === undefined ? Math.round(Math.random() * canvas.width) : x;
        this.y =
          y === undefined ? Math.round(Math.random() * canvas.height) : y;
        this.radius = Math.ceil(
          config.minParticleSize +
            Math.random() * (config.maxParticleSize - config.minParticleSize)
        );
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = Math.pow(Math.ceil(Math.random() * config.maxSpeed), 0.7);
        this.direction = Math.round(Math.random() * 360);
      }

      update() {
        const angle = 180 - (this.direction + 90); // find the 3rd angle
        if (this.direction > 0 && this.direction < 180) {
          this.x +=
            (this.speed * Math.sin(this.direction)) / Math.sin(this.speed);
        } else {
          this.x -=
            (this.speed * Math.sin(this.direction)) / Math.sin(this.speed);
        }
        if (this.direction > 90 && this.direction < 270) {
          this.y += (this.speed * Math.sin(angle)) / Math.sin(this.speed);
        } else {
          this.y -= (this.speed * Math.sin(angle)) / Math.sin(this.speed);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
      }
    }

    const removeParticlesOutsideCanvas = () => {
      particles = particles.filter((p) => {
        return (
          p.x > -100 &&
          p.y > -100 &&
          p.x < canvas.width + 100 &&
          p.y < canvas.height + 100
        );
      });
    };

    const addParticles = function (
      numParticles: number,
      x?: number,
      y?: number
    ) {
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(x, y));
      }
    };

    let nextExplosion = Number.NEGATIVE_INFINITY;

    const frame = (time: number) => {
      if (!run) return;

      if (time > nextExplosion) {
        removeParticlesOutsideCanvas();
        addParticles(
          config.particleNumber,
          Math.round(Math.random() * canvas.width),
          Math.round(Math.random() * canvas.height)
        );
        nextExplosion =
          time + Math.random() * config.maxTimeBetweenExplosionsMillis;
      }

      drawBackground();
      particles.forEach((p) => p.draw());
      particles.forEach((p) => p.update());

      window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame(frame);

    animationClickRef.current = (event) => {
      removeParticlesOutsideCanvas();
      addParticles(config.particleNumber, event.clientX, event.clientY);
    };

    return () => {
      run = false;
    };
  }, [windowSize]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (animationClickRef.current !== undefined) {
      animationClickRef.current(event);
    }
  };

  return (
    <StyledGameFinishedAnimation onClick={handleClick}>
      <canvas width="100" height="100" ref={canvasRef}></canvas>
      <div>Done!</div>
      <div>
        <button className="button" onClick={handleShowStories}>
          See finished stories
        </button>
      </div>
    </StyledGameFinishedAnimation>
  );
};

export default GameFinishedAnimation;

const StyledGameFinishedAnimation = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
`;
