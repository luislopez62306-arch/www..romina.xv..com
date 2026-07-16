import React, { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Grid, Film, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCleanUrl } from "../types";

interface PhotoGalleryProps {
  images?: string[];
}

const FALLBACK_IMAGES = [
  "https://i.ibb.co/ksYhJ0vf/IMG-4049.jpg",
  "https://i.ibb.co/MxvFRXNt/IMG-4048.jpg",
  "https://i.ibb.co/zTq4LxFW/IMG-4046.jpg",
  "https://i.ibb.co/fdwFSF2f/IMG-4051.jpg",
  "https://i.ibb.co/5fpRb1q/IMG-4050.jpg",
];

export default function PhotoGallery({ images }: PhotoGalleryProps) {
  const rawImages = images && images.length > 0 ? images : FALLBACK_IMAGES;
  
  // Resolve clean URLs
  const galleryImages = rawImages.map((img, idx) => {
    return getCleanUrl(img, FALLBACK_IMAGES[idx] || FALLBACK_IMAGES[0]);
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play for carousel view
  useEffect(() => {
    if (viewMode !== "carousel" || !isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [galleryImages.length, viewMode, isPlaying]);

  // Lightbox arrow navigation callbacks
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIdx((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length));
  }, [galleryImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIdx((prev) => (prev === null ? null : (prev + 1) % galleryImages.length));
  }, [galleryImages.length]);

  // Handle keyboard events for lightbox
  useEffect(() => {
    if (selectedIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setSelectedIdx(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, handlePrev, handleNext]);

  return (
    <section id="galeria-fotos" className="w-full py-24 px-6 bg-[#FDFBF7] text-center overflow-hidden relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="font-montserrat text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-4 font-bold">
          Sesión de Fotos
        </h2>
        <p className="font-script text-[4rem] md:text-[6rem] text-[#9D6B84] mb-6 leading-tight">
          Mis Momentos
        </p>
        <p className="font-montserrat text-xs md:text-sm text-gray-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
          Un hermoso recorrido a través del tiempo, capturando las sonrisas, sueños y destellos de esta etapa tan especial.
        </p>

        {/* Dynamic Mode Switcher */}
        <div className="flex justify-center mb-12" id="gallery-mode-switch">
          <div className="inline-flex items-center gap-1 bg-[#FAF5F5] border border-[#D49A89]/20 p-1.5 rounded-full shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-montserrat text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-[#9D6B84] text-white shadow-md"
                  : "text-[#9D6B84] hover:bg-[#9D6B84]/5"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Mosaico
            </button>
            <button
              onClick={() => setViewMode("carousel")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-montserrat text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                viewMode === "carousel"
                  ? "bg-[#9D6B84] text-white shadow-md"
                  : "text-[#9D6B84] hover:bg-[#9D6B84]/5"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Carrusel
            </button>
          </div>
        </div>

        {/* View Layout Switcher */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            /* GRID VIEW (Asymmetric Masonry Columns matching your design template) */
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="columns-2 md:columns-3 gap-4 max-w-4xl mx-auto space-y-4"
              id="gallery-grid"
            >
              {galleryImages.map((imgUrl, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedIdx(idx)}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-lg border border-[#E88295]/20 cursor-pointer bg-white inline-block w-full mb-4"
                >
                  <img
                    src={imgUrl}
                    alt={`Momento ${idx + 1}`}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105 block"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {/* Outer elegant inner margin frame */}
                  <div className="absolute inset-0 border border-white/20 rounded-2xl m-2 pointer-events-none z-10"></div>
                  
                  {/* Elegant overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4 pb-6 z-20">
                    <div className="bg-white/95 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <ZoomIn className="w-3.5 h-3.5 text-[#8C3345]" />
                      <span className="font-montserrat text-[9px] uppercase tracking-wider text-gray-700 font-bold">Zoom</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* CAROUSEL VIEW (Classic Slider with Controls) */
            <motion.div
              key="carousel-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto relative"
              id="gallery-carousel"
            >
              <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-[#E88295]/30 bg-white group/carousel">
                {/* Slides */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIdx}
                    src={galleryImages[currentIdx]}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    alt={`Momento ${currentIdx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedIdx(currentIdx)}
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Inner White Frame */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-3xl m-3 pointer-events-none z-10"></div>

                {/* Left Arrow Navigation */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#8C3345] shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 min-h-[44px] min-w-[44px] cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Arrow Navigation */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx((prev) => (prev + 1) % galleryImages.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#8C3345] shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 min-h-[44px] min-w-[44px] cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Auto Play / Pause Overlay Toggle */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition shadow-md backdrop-blur-xs cursor-pointer"
                  title={isPlaying ? "Pausar reproducción" : "Reanudar reproducción"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                {/* Quick zoom icon indicator */}
                <div 
                  onClick={() => setSelectedIdx(currentIdx)}
                  className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition shadow-md backdrop-blur-xs cursor-pointer"
                  title="Agrandar imagen"
                >
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Navigation Dots and Info */}
              <div className="flex flex-col items-center gap-3 mt-6">
                <div className="flex justify-center gap-2.5">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                        idx === currentIdx ? "bg-[#8C3345] scale-125" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      title={`Ver foto ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="font-montserrat text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Foto {currentIdx + 1} de {galleryImages.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMPREHENSIVE LIGHTBOX MODAL WITH FULL NAVIGATION */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedIdx(null)}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md select-none"
            id="gallery-lightbox"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-300 focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center z-55 cursor-pointer"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3.5 transition-all duration-300 focus:outline-none z-55 min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
              title="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3.5 transition-all duration-300 focus:outline-none z-55 min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
              title="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Image View */}
            <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={galleryImages[selectedIdx]}
                  alt={`Momento agrandado ${selectedIdx + 1}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            {/* Pagination indicator & Keyboard Hint */}
            <div className="flex flex-col items-center gap-1 mt-6 text-center">
              <div className="text-white font-montserrat text-xs uppercase tracking-[0.2em] font-semibold">
                Momento {selectedIdx + 1} de {galleryImages.length}
              </div>
              <div className="text-white/40 font-montserrat text-[9px] uppercase tracking-widest hidden md:block">
                Usa las flechas del teclado ← o → para navegar
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
