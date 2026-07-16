import React, { useEffect, useRef } from "react";

interface FestiveConfettiProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: "circle" | "rect" | "sparkle";
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
}

const COLORS = [
  "#D49A89", // Blush
  "#9D6B84", // Rose Dark
  "#8C3345", // Deep Crimson
  "#F3C68F", // Champagne Gold
  "#E88295", // Soft Rose
  "#FFF5E1", // Soft Cream
];

export default function FestiveConfetti({ active }: FestiveConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Resize canvas to cover full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a particle
    const createParticle = (x: number, y: number, angle: number, speed: number, shape: "circle" | "rect" | "sparkle"): Particle => {
      const size = Math.random() * 8 + 6;
      return {
        x,
        y,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        decay: Math.random() * 0.005 + 0.004, // fade out over ~4-5 seconds
      };
    };

    // Spawn dual corner cannons shooting up & inwards
    const spawnCannons = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Left Cannon
      for (let i = 0; i < 90; i++) {
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4; // Aiming upwards/rightwards
        const speed = Math.random() * 16 + 12;
        const shape = Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "sparkle";
        particles.push(createParticle(0, height, angle, speed, shape));
      }

      // Right Cannon
      for (let i = 0; i < 90; i++) {
        const angle = -Math.PI * 3 / 4 + (Math.random() - 0.5) * 0.4; // Aiming upwards/leftwards
        const speed = Math.random() * 16 + 12;
        const shape = Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "sparkle";
        particles.push(createParticle(width, height, angle, speed, shape));
      }

      // Center Sparklers (bursting in the middle)
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        particles.push(createParticle(width / 2, height / 2.5, angle, speed, "sparkle"));
      }
    };

    spawnCannons();

    // Physics parameters
    const gravity = 0.22;
    const wind = 0.02;

    const updateAndRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vy += gravity;
        p.vx += (Math.random() - 0.5) * 0.15 + wind;
        
        // Air resistance drag
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === "rect") {
          // Standard confetti rectangle
          const w = p.size * Math.cos(p.wobble);
          ctx.fillRect(-w / 2, -p.size / 2, w, p.size);
        } else if (p.shape === "circle") {
          // Circle confetti
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparkling star/diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(updateAndRender);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Start loop
    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-45"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
