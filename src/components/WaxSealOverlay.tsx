import React, { useState } from "react";
import { motion } from "motion/react";
import { MailOpen } from "lucide-react";

interface WaxSealOverlayProps {
  onOpen: () => void;
  name: string;
}

export default function WaxSealOverlay({ onOpen, name }: WaxSealOverlayProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);

  const handleOpenClick = () => {
    if (isOpened) return;
    setIsOpened(true);
    // After the envelope opens and card slides up, show the elegant entry button
    setTimeout(() => {
      setShowEnterButton(true);
    }, 1200);
  };

  const firstLetter = "R"; // Romina

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
      onClick={!isOpened ? handleOpenClick : undefined}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFBF7]/95 backdrop-blur-md select-none overflow-hidden ${!isOpened ? "cursor-pointer" : ""}`}
    >
      {/* Main 3D Envelope Wrapper (Full Screen Vertical Format) */}
      <div 
        id="envelope-wrapper" 
        className="absolute inset-0 w-screen h-screen transition-transform duration-1000"
        style={{ perspective: "1500px" }}
      >
        {/* 1. Envelope Interior Background */}
        <div className="absolute inset-0 bg-[#C98A92] z-0" />

        {/* 2. Slide-up Invitation Card (Escondida adentro) */}
        <motion.div
          id="invite-card"
          initial={{ y: "20vh", scale: 0.9, opacity: 0.5, zIndex: 10 }}
          animate={isOpened ? { y: "-8vh", scale: 1, opacity: 1, zIndex: 35 } : { y: "20vh", scale: 0.9, opacity: 0.5, zIndex: 10 }}
          transition={{ 
            duration: 1.5, 
            delay: 0.5, 
            ease: [0.25, 1, 0.5, 1] 
          }}
          className="absolute left-1/2 top-[28%] -translate-x-1/2 bg-[#FDFBF7] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center p-6 md:p-12 border border-[#FAF5F5] w-[85%] max-w-[420px] h-[52vh] md:h-[58vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-sans text-xs md:text-sm text-[#9D6B84] tracking-[0.4em] uppercase mb-1 md:mb-2 font-bold">
            Mis 15 Años
          </span>
          <h1 className="font-script text-6xl md:text-8xl text-[#9D6B84] leading-none mb-3">
            Romina
          </h1>
          
          <div className="w-16 h-[1px] bg-[#9D6B84]/25 my-3 md:my-4" />

          <p className="font-sans text-[9px] md:text-xs text-gray-400 uppercase tracking-widest mt-1">
            Invitación Personalizada para:
          </p>
          <p className="font-sans text-lg md:text-2xl text-[#9D6B84] font-bold mt-2 uppercase tracking-wide px-3 text-center truncate max-w-full">
            {name || "Invitado Especial"}
          </p>

          {/* Inline entry button shown after sliding up */}
          {showEnterButton && (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="mt-6 md:mt-8 px-8 py-3 bg-[#9D6B84] text-white hover:bg-[#D49A89] rounded-full font-sans text-xs uppercase tracking-widest font-extrabold transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-105 flex items-center gap-2 cursor-pointer min-h-[40px]"
            >
              <MailOpen className="w-4 h-4" />
              <span>Entrar</span>
            </motion.button>
          )}
        </motion.div>

        {/* 3. Left Flap (Solapa Izquierda) */}
        <div 
          className="absolute inset-0 bg-[#DCA9AC] z-20 pointer-events-none" 
          style={{ clipPath: "polygon(0 0, 0 100%, 55% 50%)" }}
        />
        
        {/* 4. Right Flap (Solapa Derecha) */}
        <div 
          className="absolute inset-0 bg-[#D8A1A4] z-20 pointer-events-none" 
          style={{ clipPath: "polygon(100% 0, 100% 100%, 45% 50%)" }}
        />
        
        {/* 5. Bottom Flap (Solapa Inferior, encima de las laterales para volumen) */}
        <div 
          className="absolute inset-0 bg-[#E8C5C8] z-20 drop-shadow-[0_-5px_15px_rgba(0,0,0,0.18)] pointer-events-none" 
          style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 48%)" }}
        />
        
        {/* 6. Top Flap (La que se abre, simulando el pico hacia abajo) */}
        <motion.div
          id="top-flap"
          initial={{ rotateX: 0, zIndex: 30 }}
          animate={isOpened ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="absolute inset-0 bg-[#D5969C] drop-shadow-[0_5px_15px_rgba(0,0,0,0.22)] pointer-events-none"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 50% 55%)",
            transformOrigin: "top center",
          }}
        />

        {/* 7. Sello de Cera (Rose Gold) - Centrado en la pantalla */}
        <button
          onClick={handleOpenClick}
          id="open-seal-btn"
          disabled={isOpened}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 outline-none group transition-all duration-500 ${
            isOpened ? "opacity-0 scale-75 pointer-events-none" : "hover:scale-110"
          }`}
          aria-label="Abrir sobre"
        >
          {/* wax seal outer rim */}
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#EBBAB9] via-[#D5969C] to-[#9D6B84] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/30 relative">
            <div className="w-22 h-22 md:w-26 md:h-26 rounded-full border-[1.5px] border-white/50 flex items-center justify-center bg-gradient-to-br from-[#D5969C] to-[#C98A92] shadow-inner">
              <span className="font-script text-6xl md:text-7xl text-white drop-shadow-md">
                {firstLetter}
              </span>
            </div>
            
            {/* Pulsing light effect inside seal */}
            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-25 pointer-events-none" />
          </div>

          <span 
            id="open-text" 
            className="absolute top-full mt-6 left-1/2 -translate-x-1/2 text-[#9D6B84] text-xs md:text-sm uppercase tracking-[0.35em] font-bold animate-pulse w-max transition-opacity duration-300 drop-shadow-md"
          >
            Tocar para abrir
          </span>
        </button>
      </div>
    </motion.div>
  );
}
