import React, { useState } from "react";

interface FlipCardProps {
  title: string;
  icon: React.ReactNode;
  venueName: string;
  time: string;
  address: string;
  mapUrl: string;
}

export default function FlipCard({
  title,
  icon,
  venueName,
  time,
  address,
  mapUrl,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

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
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer h-[420px] w-full max-w-sm mx-auto perspective-1000 select-none"
      id={`flip-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
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
        {/* FRONT OF THE CARD */}
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
            {icon}
          </div>

          <h3 className="font-sans text-sm text-[#9D6B84] mb-6 uppercase tracking-[0.2em] font-bold">
            {title}
          </h3>

          <p className="font-script text-4xl text-[#D49A89] animate-pulse">
            Tocar para girar
          </p>
        </div>

        {/* BACK OF THE CARD */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] relieve-3d flex flex-col justify-center items-center p-8 overflow-hidden">
          {/* Specular Shine Overlay (adjusted coordinates for back side) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[24px] z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 240px at ${100 - coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)`,
              mixBlendMode: "overlay",
              opacity: isHovered ? 1 : 0,
            }}
          />

          <h3 className="font-script text-5xl text-[#D49A89] mb-6 leading-tight text-center">
            {venueName}
          </h3>

          <div className="px-8 py-3 hundido-3d rounded-full mb-6">
            <p className="font-sans text-xs text-[#9D6B84] uppercase tracking-[0.3em] font-extrabold">
              {time}
            </p>
          </div>

          <p className="font-sans text-xs text-[#4A4A4A] mb-10 font-bold uppercase tracking-widest leading-relaxed text-center max-w-[240px]">
            {address}
          </p>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Prevent card flipping again when clicking the button
              e.stopPropagation();
            }}
            className="boton-3d px-10 py-4 rounded-full uppercase tracking-widest text-xs font-bold text-white relative z-40"
          >
            Ver Mapa
          </a>
        </div>
      </div>

      {/*/ * Tailwind helper to support 3D rotations in custom CSS */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
