import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Gift, 
  Award, 
  ChevronDown,
  Settings
} from "lucide-react";

import { InvitationConfig, RsvpEntry, INITIAL_CONFIG, PassEntry, getCleanUrl, GuestBookEntry } from "./types";
import WaxSealOverlay from "./components/WaxSealOverlay";
import AudioPlayer from "./components/AudioPlayer";
import FlipCard from "./components/FlipCard";
import DressCodeCard from "./components/DressCodeCard";
import PhotoGallery from "./components/PhotoGallery";
import RsvpForm from "./components/RsvpForm";
import GuestBook from "./components/GuestBook";
import AdminPanel from "./components/AdminPanel";
import FestiveConfetti from "./components/FestiveConfetti";

// Real-time Countdown Timer Component
function CountdownTimer({ targetDateString }: { targetDateString: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse the event date and append local time (ceremony starts at 5:00 PM)
      const targetDate = new Date(`${targetDateString}T17:00:00`);
      const now = new Date();
      const difference = +targetDate - +now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDateString]);

  if (timeLeft.isOver) {
    return (
      <div className="text-center font-sans font-bold text-[#8C3345] tracking-[0.25em] text-xs py-4 uppercase animate-pulse">
        ✨ ¡Hoy es el gran día! ✨
      </div>
    );
  }

  const timerItems = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto my-8">
      {timerItems.map((item, idx) => (
        <div key={idx} className="relieve-3d p-4 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
          <p className="font-sans text-xl md:text-2xl font-bold text-[#9D6B84] tracking-tight">
            {item.value.toString().padStart(2, "0")}
          </p>
          <p className="font-sans text-[9px] uppercase tracking-wider text-[#D49A89] mt-2 font-bold">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDressCodeFlipped, setIsDressCodeFlipped] = useState(false);
  const [isChildrenFlipped, setIsChildrenFlipped] = useState(false);
  const [showSecretAdmin, setShowSecretAdmin] = useState(false);
  
  // Private admin/organizer mode via secret query parameter (?admin=true or ?organizador=true)
  const isAdminMode = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("admin") === "true" ||
    new URLSearchParams(window.location.search).get("organizador") === "true"
  );
  
  // Persistent configuration state
  const [config, setConfig] = useState<InvitationConfig>(() => {
    const savedVersion = localStorage.getItem("romina_15_config_version");
    const CURRENT_VERSION = "v16"; // Force upgrade to load the updated custom names and details
    
    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("romina_15_config_version", CURRENT_VERSION);
      localStorage.setItem("romina_15_config", JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }

    const saved = localStorage.getItem("romina_15_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Helper to remove PEGAR_AQUI placeholders
        const clean = (val: string, fallback: string) => {
          if (!val || val.includes("PEGAR_AQUI") || val.trim() === "") {
            return fallback;
          }
          return val;
        };

        const cleanArray = (arr: string[] | undefined, fallback: string[]): string[] => {
          if (!arr || arr.length === 0) return fallback;
          return arr.map((item, idx) => {
            if (!item || item.includes("PEGAR_AQUI") || item.trim() === "") {
              return fallback[idx] || fallback[0];
            }
            return item;
          });
        };

        const migrateImageUrl = (url: string): string => {
          if (!url) return url;
          return url
            .replace(/xtq7QQ3L/g, "ks2SFFMB")
            .replace(/fdwFSF2f/g, "jkXf5fTm")
            .replace(/ksYhJ0vf/g, "NdwLrpbP")
            .replace(/MxvFRXNt/g, "HfS5rJgb")
            .replace(/zTq4LxFW/g, "S4F31ycD")
            .replace(/5fpRb1q/g, "Zk4Mqfy");
        };

        // Robust photoshoot-aware migration. Ensures any photoshoot defaults are correctly mapped,
        // while custom images uploaded/set by the user are preserved.
        const isPhotoshootUrl = (url: string) => {
          if (!url) return false;
          // Solo detectamos como fotos por defecto de la plantilla las que contengan específicamente
          // las combinaciones de ID y nombre de archivo originales del photoshoot.
          // Si el usuario subió una imagen personalizada propia a ImgBB, esta NO debe ser reemplazada por la plantilla.
          const originalTemplatePhotos = [
            "ks2SFFMB/IMG-4052",
            "NdwLrpbP/IMG-4049",
            "HfS5rJgb/IMG-4048",
            "S4F31ycD/IMG-4046",
            "jkXf5fTm/IMG-4051",
            "Zk4Mqfy/IMG-4050"
          ];
          return originalTemplatePhotos.some(photo => url.includes(photo));
        };

        let resolvedCoverImageUrl = migrateImageUrl(clean(parsed.coverImageUrl, INITIAL_CONFIG.coverImageUrl));
        if (isPhotoshootUrl(resolvedCoverImageUrl)) {
          resolvedCoverImageUrl = INITIAL_CONFIG.coverImageUrl;
        }

        let resolvedCoverImages = cleanArray(parsed.coverImages, INITIAL_CONFIG.coverImages || []).map(migrateImageUrl);
        if (resolvedCoverImages.some(isPhotoshootUrl)) {
          resolvedCoverImages = INITIAL_CONFIG.coverImages || [];
        }

        let resolvedGalleryImages = cleanArray(parsed.galleryImages, INITIAL_CONFIG.galleryImages || []).map(migrateImageUrl);
        if (resolvedGalleryImages.some(isPhotoshootUrl)) {
          resolvedGalleryImages = INITIAL_CONFIG.galleryImages || [];
        }

        const merged = {
          ...INITIAL_CONFIG,
          ...parsed,
          musicUrl: clean(parsed.musicUrl, INITIAL_CONFIG.musicUrl),
          coverImageUrl: resolvedCoverImageUrl,
          coverImages: resolvedCoverImages,
          galleryImages: resolvedGalleryImages,
          parents: { ...INITIAL_CONFIG.parents, ...(parsed.parents || {}) },
          padrinos: { ...INITIAL_CONFIG.padrinos, ...(parsed.padrinos || {}) },
          chambelan: clean(parsed.chambelan, INITIAL_CONFIG.chambelan || "Luis Ernesto Armenta Carrillo"),
          ceremony: { ...INITIAL_CONFIG.ceremony, ...(parsed.ceremony || {}) },
          reception: { ...INITIAL_CONFIG.reception, ...(parsed.reception || {}) },
          dressCode: { ...INITIAL_CONFIG.dressCode, ...(parsed.dressCode || {}) },
          gifts: { ...INITIAL_CONFIG.gifts, ...(parsed.gifts || {}) },
        };
        
        // Save the migrated config so future loads don't need migration
        localStorage.setItem("romina_15_config", JSON.stringify(merged));
        return merged;
      } catch (e) {
        console.error("Error reading config from localStorage", e);
      }
    }
    return INITIAL_CONFIG;
  });

  // Persistent RSVPs list state
  const [rsvpList, setRsvpList] = useState<RsvpEntry[]>(() => {
    const saved = localStorage.getItem("romina_15_rsvps");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading RSVPs from localStorage", e);
      }
    }
    return [];
  });

  // Persistent passes list state
  const [passesList, setPassesList] = useState<PassEntry[]>(() => {
    const saved = localStorage.getItem("romina_15_passes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading passes from localStorage", e);
      }
    }
    return [];
  });

  // Persistent guestbook entries state
  const [guestBookEntries, setGuestBookEntries] = useState<GuestBookEntry[]>(() => {
    const saved = localStorage.getItem("romina_15_guestbook");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading guestbook from localStorage", e);
      }
    }
    return [];
  });

  const [currentPass, setCurrentPass] = useState<PassEntry | null>(null);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  const FALLBACK_HERO_IMAGES = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    "https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=1200",
    "https://images.unsplash.com/photo-1507504038482-7621c2243e8a?q=80&w=1200"
  ];

  const heroImages = (config.coverImages && config.coverImages.length > 0)
    ? config.coverImages
    : [config.coverImageUrl || ""];

  const cleanHeroImages = heroImages.map((img, idx) =>
    getCleanUrl(img, FALLBACK_HERO_IMAGES[idx] || FALLBACK_HERO_IMAGES[0])
  );

  useEffect(() => {
    if (cleanHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % cleanHeroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cleanHeroImages.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paseCode = params.get("pase");
    if (paseCode) {
      const found = passesList.find((p) => p.id === paseCode);
      if (found) {
        setCurrentPass(found);
      } else {
        // Reconstruct from URL parameters if not found locally (e.g. on guest's device)
        const urlName = params.get("name");
        const urlPasesStr = params.get("pases");
        if (urlName) {
          try {
            const guestNameDecoded = decodeURIComponent(urlName);
            const urlPases = urlPasesStr ? parseInt(urlPasesStr, 10) : 1;
            const tempPass: PassEntry = {
              id: paseCode,
              guestName: guestNameDecoded,
              totalPasses: isNaN(urlPases) ? 1 : urlPases,
            };
            setCurrentPass(tempPass);
            
            // Add to client's passesList to persist locally
            setPassesList((prev) => {
              if (prev.some((p) => p.id === paseCode)) return prev;
              const updated = [tempPass, ...prev];
              localStorage.setItem("romina_15_passes", JSON.stringify(updated));
              return updated;
            });
          } catch (e) {
            console.error("Error decoding pass from URL", e);
          }
        }
      }
    }
  }, [passesList]);

  // Persist config adjustments
  const handleUpdateConfig = (newConfig: InvitationConfig) => {
    setConfig(newConfig);
    localStorage.setItem("romina_15_config", JSON.stringify(newConfig));
  };

  // Persist RSVP registrations
  const handleAddRsvp = (newRsvp: RsvpEntry) => {
    const updatedList = [newRsvp, ...rsvpList];
    setRsvpList(updatedList);
    localStorage.setItem("romina_15_rsvps", JSON.stringify(updatedList));

    // Also check if they RSVP'd using a specific pass
    const urlParams = new URLSearchParams(window.location.search);
    const paseCode = urlParams.get("pase");
    if (paseCode) {
      const updatedPasses = passesList.map((p) => {
        if (p.id === paseCode) {
          return {
            ...p,
            confirmed: newRsvp.attending ? ("yes" as const) : ("no" as const),
            confirmedName: newRsvp.name,
            confirmedCompanions: newRsvp.companions,
          };
        }
        return p;
      });
      setPassesList(updatedPasses);
      localStorage.setItem("romina_15_passes", JSON.stringify(updatedPasses));
    }
  };

  // Admin clear RSVPs helper
  const handleClearRsvps = () => {
    setRsvpList([]);
    localStorage.removeItem("romina_15_rsvps");
  };

  // Admin remove single guest helper
  const handleRemoveRsvp = (id: string) => {
    const updatedList = rsvpList.filter((item) => item.id !== id);
    setRsvpList(updatedList);
    localStorage.setItem("romina_15_rsvps", JSON.stringify(updatedList));
  };

  // Pass helpers
  const handleAddPass = (newPass: PassEntry) => {
    const updatedList = [...passesList, newPass];
    setPassesList(updatedList);
    localStorage.setItem("romina_15_passes", JSON.stringify(updatedList));
  };

  const handleRemovePass = (id: string) => {
    const updatedList = passesList.filter((p) => p.id !== id);
    setPassesList(updatedList);
    localStorage.setItem("romina_15_passes", JSON.stringify(updatedList));
  };

  const handleAddGuestBookEntry = (newEntry: GuestBookEntry) => {
    const updated = [newEntry, ...guestBookEntries];
    setGuestBookEntries(updated);
    localStorage.setItem("romina_15_guestbook", JSON.stringify(updated));
  };

  const handleRemoveGuestBookEntry = (id: string) => {
    const updated = guestBookEntries.filter((item) => item.id !== id);
    setGuestBookEntries(updated);
    localStorage.setItem("romina_15_guestbook", JSON.stringify(updated));
  };

  const handleOpenInvitation = () => {
    setIsOverlayOpen(false);
    // Grant immediate playback trigger
    setShouldPlayMusic(true);
    // Trigger festive particle confetti explosion
    setShowConfetti(true);
  };

  return (
    <div className="relative min-h-screen selection:bg-blush selection:text-white overflow-x-hidden">
      
      {/* 0. WAX SEAL OVERLAY LANDING PAGE */}
      <AnimatePresence>
        {isOverlayOpen && (
          <WaxSealOverlay onOpen={handleOpenInvitation} name={currentPass?.guestName || "Invitado Especial"} />
        )}
      </AnimatePresence>

      {/* Festive Confetti / Fireworks Particles */}
      <FestiveConfetti active={showConfetti} />

      {/* 1. HERO COVER HEADER */}
      <header className="relative w-full h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden select-none">
        
        {/* FOTOS DE FONDO CON TRANSICIÓN ULTRA-SUAVE (CINEMATIC CROSSFADE) */}
        <div className="absolute inset-0 z-0 bg-[#0F0E0E] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentHeroIdx}
              src={cleanHeroImages[currentHeroIdx]} 
              alt={`${config.name} Portada`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          {/* Capa sutil de sombra solo para legibilidad, sin alterar la imagen */}
          <div className="absolute inset-0 bg-black/20 z-1 pointer-events-none"></div>

          {/* Degradado inferior para fusionar suavemente con la parte de abajo */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#FDFBF7] to-transparent z-2 pointer-events-none"></div>
        </div>

        {/* MARCO ELEGANTE DE ALTA COSTURA / PHYSICAL CARD STYLE FRAME */}
        <div className="absolute inset-4 md:inset-8 border border-white/20 pointer-events-none z-10 rounded-2xl"></div>
        <div className="absolute inset-5 md:inset-10 border border-white/20 pointer-events-none z-10 rounded-xl">
          {/* Esquinas ornamentales estilo victoriano minimalista */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/60"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/60"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-white/60"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/60"></div>
        </div>
        
        {/* TEXTO GIGANTE Y LIBRE */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={!isOverlayOpen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative z-20 w-full flex flex-col items-center pt-8 md:pt-12"
        >
          {/* Subtítulo elegante arriba del nombre */}
          <p className="font-sans text-xs md:text-sm text-white/90 tracking-[0.6em] uppercase mb-4 font-semibold drop-shadow-md">
            Mis XV
          </p>

          {/* El nombre gigante con tipografía manuscrita y sombra */}
          <h1 
            className="font-script text-[6.5rem] sm:text-[8.5rem] md:text-[11rem] lg:text-[12.5rem] text-white leading-none tracking-normal py-2 px-4" 
            style={{ 
              textShadow: "0 10px 30px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.35)" 
            }}
          >
            {config.name}
          </h1>
          
          {/* Fecha elegante abajo del nombre */}
          <p className="font-sans text-[11px] md:text-xs text-white font-bold tracking-[0.55em] uppercase drop-shadow-md mt-6 mb-2">
            {config.timePrefix}
          </p>
          <p className="font-sans text-[13px] md:text-sm text-white font-bold tracking-[0.3em] uppercase drop-shadow-sm">
            {config.year || "2026"}
          </p>
        </motion.div>
        
        {/* Indicador de Scroll de Alta Fidelidad */}
        <div className="absolute bottom-10 z-20 flex flex-col items-center pointer-events-none">
          <span className="font-sans text-[9px] uppercase tracking-[0.45em] text-white/70 mb-3 font-semibold">
            Desliza para Descubrir
          </span>
          <div className="w-[20px] h-[34px] border border-white/30 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ 
                y: [0, 10, 0],
              }}
              transition={{ 
                duration: 1.6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </div>
      </header>

      {/* 2. LIVE COUNTDOWN SECTION */}
      <section className="w-full py-16 px-6 text-center select-none">
        <div className="max-w-md mx-auto">
          <p className="font-sans text-xs text-[#8C3345] uppercase tracking-[0.25em] mb-4 font-bold">
            Comienza la cuenta regresiva...
          </p>
          <CountdownTimer targetDateString={config.date} />
        </div>
      </section>

      {/* SECCIÓN DE FOTO INTERMEDIA 1 */}
      <section className="w-full py-12 px-6 flex justify-center bg-[#FDFBF7] relative overflow-hidden">
        {/* Adornos sutiles */}
        <div className="absolute top-10 left-10 w-24 h-24 border border-blush/10 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-blush/10 rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-[340px] md:max-w-md w-full rounded-[24px] overflow-hidden shadow-2xl border-4 border-white p-3 bg-white transform rotate-[-1deg]"
        >
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
            <img
              src={getCleanUrl(config.galleryImages?.[0] || "https://i.ibb.co/ksYhJ0vf/IMG-4049.jpg", "https://i.ibb.co/ksYhJ0vf/IMG-4049.jpg")}
              alt="Momento Especial Romina"
              className="w-full h-full object-cover filter brightness-[1.01] contrast-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="pt-4 pb-2 text-center select-none">
            <p className="font-script text-3xl text-rose-dark">Romina</p>
          </div>
        </motion.div>
      </section>

      {/* 3. PARENTS, GODPARENTS, AND CHAMBELAN BLESSINGS */}
      <section
        id="parents-section"
        className="w-full py-24 px-6 bg-[#FAF5F5] text-center relative z-20 overflow-hidden"
      >
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-2xl mx-auto flex flex-col items-center"
        >
          {/* Heart SVG */}
          <motion.svg 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="w-8 h-8 text-blush mx-auto mb-6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </motion.svg>
          
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="font-sans text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-8 font-bold"
          >
            Con la bendición de Dios<br />y de mis padres
          </motion.h2>
          
          <div className="mb-14 flex flex-col items-center justify-center space-y-1">
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              className="font-script text-5xl md:text-6xl text-rose-dark"
            >
              {config.parents.father}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
              className="font-script text-4xl text-blush"
            >
              &amp;
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.4 }}
              className="font-script text-5xl md:text-6xl text-rose-dark"
            >
              {config.parents.mother}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.5 }}
            className="w-16 h-px bg-blush mx-auto mb-14"
          />
          
          {/* Star Blessing SVG */}
          <motion.svg 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="w-8 h-8 text-blush mx-auto mb-6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.15 5.071c.11.48-.385.898-.8.677L12.322 17.9a.565.565 0 00-.644 0l-4.52 2.522c-.415.221-.91-.197-.8-.677l1.15-5.071a.563.563 0 00-.181-.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </motion.svg>
          
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="font-sans text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-8 font-bold"
          >
            Y mis padrinos
          </motion.h2>
          
          <div className="mb-14 flex flex-col items-center justify-center space-y-1">
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              className="font-script text-5xl md:text-6xl text-rose-dark"
            >
              {config.padrinos.godmother}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
              className="font-script text-4xl text-blush"
            >
              &amp;
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.4 }}
              className="font-script text-5xl md:text-6xl text-rose-dark"
            >
              {config.padrinos.godfather}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.5 }}
            className="w-16 h-px bg-blush mx-auto mb-14"
          />

          {/* Sparkles SVG */}
          <motion.svg 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="w-8 h-8 text-blush mx-auto mb-6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </motion.svg>
          
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="font-sans text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-8 font-bold"
          >
            Chambelán de Honor
          </motion.h2>
          
          <div className="flex flex-col items-center justify-center space-y-1">
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              className="font-script text-5xl md:text-6xl text-rose-dark"
            >
              {(() => {
                const parts = (config.chambelan || "Luis Ernesto Armenta Carrillo").split(" ");
                return parts.slice(0, 2).join(" ");
              })()}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
              className="font-script text-4xl md:text-5xl text-rose-dark"
            >
              {(() => {
                const parts = (config.chambelan || "Luis Ernesto Armenta Carrillo").split(" ");
                return parts.slice(2).join(" ");
              })()}
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* SECCIÓN DE FOTO INTERMEDIA 2 */}
      <section className="w-full py-12 px-6 flex justify-center bg-[#FDFBF7] relative overflow-hidden">
        {/* Adornos sutiles */}
        <div className="absolute top-10 right-10 w-24 h-24 border border-blush/10 rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-[340px] md:max-w-md w-full rounded-[24px] overflow-hidden shadow-2xl border-4 border-white p-3 bg-white transform rotate-[1deg]"
        >
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
            <img
              src={getCleanUrl(config.galleryImages?.[1] || "https://i.ibb.co/MxvFRXNt/IMG-4048.jpg", "https://i.ibb.co/MxvFRXNt/IMG-4048.jpg")}
              alt="Mis Quince Años"
              className="w-full h-full object-cover filter brightness-[1.01] contrast-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="pt-4 pb-2 text-center select-none">
            <p className="font-script text-3xl text-rose-dark">Mis Quince Años</p>
          </div>
        </motion.div>
      </section>

      {/* 4. EVENT VENUES (FLIP CARDS) */}
      <section className="w-full py-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <span className="font-sans text-sm text-[#9D6B84] uppercase tracking-widest mb-4 font-bold block">
              Detalles del evento
            </span>
            <h2 className="font-script text-[4rem] md:text-[6rem] text-[#D49A89] mb-4 leading-tight">
              Dónde y Cuándo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            
            {/* CEREMONIA FLIP CARD */}
            <FlipCard
              title="Ceremonia Religiosa"
              venueName={config.ceremony.name}
              time={config.ceremony.time}
              address={config.ceremony.address}
              mapUrl={config.ceremony.mapUrl}
              icon={
                <svg className="w-12 h-12 text-[#9D6B84]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M8 6h8M6 22h12M12 10v4" />
                </svg>
              }
            />

            {/* RECEPCION FLIP CARD */}
            <FlipCard
              title="Recepción"
              venueName={config.reception.name}
              time={config.reception.time}
              address={config.reception.address}
              mapUrl={config.reception.mapUrl}
              icon={
                <svg className="w-12 h-12 text-[#9D6B84]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 5H3l8 9v5H7v2h10v-2h-4v-5l8-9z" />
                </svg>
              }
            />

          </div>
        </div>
      </section>

      {/* SECCIÓN DE FOTO INTERMEDIA 3 */}
      <section className="w-full py-12 px-6 flex justify-center bg-[#FDFBF7] relative overflow-hidden">
        {/* Adornos sutiles */}
        <div className="absolute bottom-10 left-10 w-32 h-32 border border-blush/10 rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-[340px] md:max-w-md w-full rounded-[24px] overflow-hidden shadow-2xl border-4 border-white p-3 bg-white"
        >
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
            <img
              src={getCleanUrl(config.galleryImages?.[2] || "https://i.ibb.co/zTq4LxFW/IMG-4046.jpg", "https://i.ibb.co/zTq4LxFW/IMG-4046.jpg")}
              alt="Celebración Especial"
              className="w-full h-full object-cover filter brightness-[1.01] contrast-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="pt-4 pb-2 text-center select-none">
            <p className="font-script text-3xl text-rose-dark">Recuerdos Inolvidables</p>
          </div>
        </motion.div>
      </section>

      {/* 3.5 ITINERARIO (NUEVA SECCIÓN DE LÍNEA DE TIEMPO) */}
      <section className="w-full py-24 px-6 bg-[#FAF5F5] text-center select-none overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="font-script text-[4rem] md:text-[6rem] text-rose-dark text-center mb-16 leading-tight"
        >
          Itinerario
        </motion.h2>
        
        <div className="max-w-md mx-auto relative border-l-2 border-blush/40 text-left pl-8 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-[41px] top-1 w-5 h-5 bg-[#FAF5F5] border-2 border-rose-dark rounded-full"></div>
            <h3 className="font-sans text-sm md:text-base text-rose-dark font-bold tracking-[0.2em] uppercase">08:00 P.M.</h3>
            <p className="font-script text-4xl text-gray-500 mt-2">Ceremonia Religiosa</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -left-[41px] top-1 w-5 h-5 bg-[#FAF5F5] border-2 border-rose-dark rounded-full"></div>
            <h3 className="font-sans text-sm md:text-base text-rose-dark font-bold tracking-[0.2em] uppercase">09:00 P.M.</h3>
            <p className="font-script text-4xl text-gray-500 mt-2">Recepción de Invitados</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -left-[41px] top-1 w-5 h-5 bg-[#FAF5F5] border-2 border-rose-dark rounded-full"></div>
            <h3 className="font-sans text-sm md:text-base text-rose-dark font-bold tracking-[0.2em] uppercase">09:30 P.M.</h3>
            <p className="font-script text-4xl text-gray-500 mt-2">Vals de Romina</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -left-[41px] top-1 w-5 h-5 bg-[#FAF5F5] border-2 border-rose-dark rounded-full"></div>
            <h3 className="font-sans text-sm md:text-base text-rose-dark font-bold tracking-[0.2em] uppercase">10:00 P.M.</h3>
            <p className="font-script text-4xl text-gray-500 mt-2">Banquete</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.5 }}
            className="relative"
          >
            <div className="absolute -left-[41px] top-1 w-5 h-5 bg-[#FAF5F5] border-2 border-rose-dark rounded-full shadow-[0_0_15px_rgba(212,154,137,0.8)] animate-pulse"></div>
            <h3 className="font-sans text-sm md:text-base text-rose-dark font-bold tracking-[0.2em] uppercase">10:30 P.M.</h3>
            <p className="font-script text-4xl text-blush mt-2 font-bold animate-pulse">¡Inicia la Fiesta!</p>
          </motion.div>
          
        </div>
      </section>

      {/* 5. DRESS CODE & GIFT DETAILS */}
      <section className="w-full py-24 px-6 bg-[#FDFBF7] text-center select-none overflow-hidden" id="detalles-especiales">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="font-script text-[4rem] md:text-[5rem] text-rose-dark text-center mb-16 leading-tight"
          >
            Detalles Especiales
          </motion.h2>
          
          {/* Tarjeta Dress Code */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="max-w-md mx-auto mb-24 cursor-pointer"
            onClick={() => setIsDressCodeFlipped(!isDressCodeFlipped)}
          >
            <div className="relative h-[380px] w-full perspective-1000">
              <div 
                className="relative w-full h-full text-center preserve-3d"
                style={{
                  transform: `rotateY(${isDressCodeFlipped ? 180 : 0}deg)`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {/* FRENTE DE LA TARJETA */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] bg-white border border-[#D49A89]/20 shadow-lg flex flex-col justify-center items-center p-8">
                  <svg className="w-16 h-16 mx-auto mb-6 text-rose-dark" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="font-sans text-sm text-rose-dark mb-4 uppercase tracking-[0.2em] font-bold">
                    Dress Code
                  </h3>
                  <p className="font-script text-3xl text-gray-400 animate-pulse">
                    Toca para descubrir
                  </p>
                </div>

                {/* REVERSO DE LA TARJETA */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] bg-white border border-[#D49A89]/20 shadow-lg flex flex-col justify-center items-center px-8 py-6">
                  <h3 className="font-script text-[4rem] text-rose-dark mb-6 leading-tight">
                    {config.dressCode.type || "Elegante"}
                  </h3>
                  
                  <p className="font-sans text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-widest mb-6">
                    {config.dressCode.description.includes("rosa") ? "Por favor, asiste con vestimenta elegante." : config.dressCode.description}
                  </p>
                  
                  <div className="w-12 h-[2px] bg-blush mx-auto mb-6 rounded-full"></div>
                  
                  <p className="font-sans text-xs text-rose-dark font-extrabold leading-relaxed uppercase tracking-[0.2em]">
                    {config.dressCode.description.includes("rosa") ? config.dressCode.description : "Me reservo amablemente el color rosa para mi vestido."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tarjeta Recepción Sin Niños (Flip) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
            className="max-w-md mx-auto mb-24 cursor-pointer"
            onClick={() => setIsChildrenFlipped(!isChildrenFlipped)}
          >
            <div className="relative h-[380px] w-full perspective-1000">
              <div 
                className="relative w-full h-full text-center preserve-3d"
                style={{
                  transform: `rotateY(${isChildrenFlipped ? 180 : 0}deg)`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {/* FRENTE DE LA TARJETA */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-[24px] bg-white border border-[#D49A89]/20 shadow-lg flex flex-col justify-center items-center p-8">
                  <svg className="w-16 h-16 mx-auto mb-6 text-rose-dark" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591-1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  <h3 className="font-sans text-sm text-rose-dark mb-4 uppercase tracking-[0.2em] font-bold">
                    Recepción Sin Niños
                  </h3>
                  <p className="font-script text-3xl text-gray-400 animate-pulse">
                    Toca para descubrir
                  </p>
                </div>

                {/* REVERSO DE LA TARJETA */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] bg-white border border-[#D49A89]/20 shadow-lg flex flex-col justify-center items-center px-8 py-6">
                  <h3 className="font-script text-[3rem] text-rose-dark mb-4 leading-tight">
                    Solo Adultos
                  </h3>
                  
                  <p className="font-sans text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-widest mb-6">
                    Amamos a sus pequeños, pero por la naturaleza de la celebración, la recepción será un evento exclusivo para jóvenes y adultos.
                  </p>
                  
                  <div className="w-12 h-[2px] bg-blush mx-auto mb-6 rounded-full"></div>
                  
                  <p className="font-sans text-xs text-rose-dark font-extrabold leading-relaxed uppercase tracking-[0.2em]">
                    ¡Agradecemos mucho su comprensión!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mesa de Regalos */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
            className="max-w-lg mx-auto"
          >
            <svg className="w-16 h-16 mx-auto mb-6 text-rose-dark" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="font-sans text-sm text-rose-dark uppercase tracking-[0.2em] font-bold mb-6">
              Mesa de Regalos
            </h2>
            <p className="font-sans text-xs text-gray-500 leading-relaxed mb-6 font-medium">
              {config.gifts.description.includes("lluvia de sobres") ? (
                <>
                  Tu presencia es mi mayor regalo, pero si deseas tener un detalle conmigo, contaremos con <span className="font-bold border-b border-gray-400">lluvia de sobres</span> el día del evento.
                </>
              ) : (
                config.gifts.description
              )}
            </p>
          </motion.div>
        </div>
      </section>



      {/* 5.5. PHOTO GALLERY */}
      <PhotoGallery images={config.galleryImages} />

      {/* 6. RSVP EVENT SIGN IN FORM */}
      <RsvpForm 
        onAddRsvp={handleAddRsvp} 
        quinceaneraName={config.name} 
        currentPass={currentPass}
      />

      {/* 6.5. GUEST BOOK SECTION */}
      <GuestBook
        entries={guestBookEntries}
        onAddEntry={handleAddGuestBookEntry}
        defaultGuestName={currentPass?.guestName}
      />

      {/* 7. EVENT FOOTER CREDIT */}
      <footer className="w-full py-20 text-center select-none">
        <div className="max-w-sm mx-auto space-y-4">
          <p className="font-script text-5xl text-[#D49A89] mb-4">
            {config.name}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#9D6B84] font-bold">
            {config.timePrefix}, {config.year} &bull; Los Mochis, Sinaloa.
          </p>
          <div className="w-12 h-[1px] bg-[#9D6B84]/25 mx-auto" />
          <p 
            onClick={() => setShowSecretAdmin(prev => !prev)}
            className="font-sans text-[9px] text-[#4A4A4A]/60 hover:text-[#9D6B84] uppercase tracking-widest mt-4 font-bold cursor-pointer transition-colors"
            title="Panel de Administración Oculto"
          >
            Hecho con amor para mis quince años.
          </p>
        </div>
      </footer>

      {/* 8. AMBIENT AUDIO CONTROLLER PLAYER */}
      <AudioPlayer musicUrl={config.musicUrl} shouldPlay={shouldPlayMusic} />

      {/* 9. HIDDEN/SECRET ORGANISER ADMIN CONTROL PANEL */}
      {(showSecretAdmin || isAdminMode) && (
        <AdminPanel
          config={config}
          onUpdateConfig={handleUpdateConfig}
          rsvpList={rsvpList}
          onClearRsvps={handleClearRsvps}
          onRemoveRsvp={handleRemoveRsvp}
          passesList={passesList}
          onAddPass={handleAddPass}
          onRemovePass={handleRemovePass}
          guestBookEntries={guestBookEntries}
          onRemoveGuestBookEntry={handleRemoveGuestBookEntry}
        />
      )}

    </div>
  );
}
