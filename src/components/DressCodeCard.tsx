import React, { useState } from "react";

interface DressCodeCardProps {
  type: string;
  description: string;
}

export default function DressCodeCard({ type, description }: DressCodeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // Suggested color swatches
  const suggestedTones = [
    { color: "#FFD1DC", name: "Rosa Pastel" },
    { color: "#E88295", name: "Blush" },
    { color: "#C36F80", name: "Rosa Viejo" },
    { color: "#8C3345", name: "Rose Dark" },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });

    // Subtle physical tilt (max 7 degrees)
    const rx = (y - 50) * -0.14; 
    const ry = (x - 50) * 0.14;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer h-[420px] w-full max-w-sm mx-auto perspective-1000 select-none"
      id="dress-code-flip-card"
    >
      <div
        className="relative w-full h-full text-center preserve-3d"
        style={{
          transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: isHovered 
            ? "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)" 
            : "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] relieve-3d flex flex-col justify-center items-center p-8 transition-all overflow-hidden">
          {/* Specular Shine Overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[24px] z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 240px at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)`,
              mixBlendMode: "overlay",
              opacity: isHovered ? 1 : 0,
            }}
          />

          <div className="w-24 h-24 rounded-full hundido-3d flex items-center justify-center mb-8 text-[#9D6B84]">
            <svg
              className="w-12 h-12 text-[#9D6B84]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          <h3 className="font-sans text-sm text-[#9D6B84] mb-6 uppercase tracking-[0.2em] font-bold">
            Dress Code
          </h3>

          <p className="font-script text-4xl text-[#D49A89] animate-pulse">
            Tocar para girar
          </p>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] relieve-3d flex flex-col justify-center items-center px-10 py-8 overflow-hidden">
          {/* Specular Shine Overlay (adjusted coordinates for back side) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[24px] z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 240px at ${100 - coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)`,
              mixBlendMode: "overlay",
              opacity: isHovered ? 1 : 0,
            }}
          />

          <h3 className="font-script text-[4rem] text-[#D49A89] mb-8 leading-tight text-center">
            {type}
          </h3>

          <p className="font-sans text-xs text-[#4A4A4A] font-bold leading-relaxed mb-8 uppercase tracking-[0.2em] text-center max-w-[240px]">
            {description}
          </p>

          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#9D6B84] font-extrabold mb-6">
            Tonos Sugeridos
          </p>

          {/* Circular Color Swatches */}
          <div className="flex justify-center gap-6 relative z-40">
            {suggestedTones.map((tone, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full hundido-3d border border-white/20 transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: tone.color }}
                title={tone.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
