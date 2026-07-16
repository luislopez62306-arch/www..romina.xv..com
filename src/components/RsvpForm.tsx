import React, { useState, useEffect } from "react";
import { CheckCircle2, User, Users, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RsvpEntry, PassEntry } from "../types";

interface RsvpFormProps {
  onAddRsvp: (entry: RsvpEntry) => void;
  quinceaneraName: string;
  currentPass?: PassEntry | null;
}

export default function RsvpForm({ onAddRsvp, quinceaneraName, currentPass }: RsvpFormProps) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<string>("");
  const [companions, setCompanions] = useState("0");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentPass) {
      setName(currentPass.guestName);
    }
  }, [currentPass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !attending) return;

    setSubmitting(true);

    const newRsvp: RsvpEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      attending: attending === "yes",
      companions: attending === "yes" ? parseInt(companions, 10) : 0,
      message: message.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    // Simulate database delay for luxurious visual polish
    setTimeout(() => {
      onAddRsvp(newRsvp);
      setSubmitting(false);
      setIsSubmitted(true);

      // Open WhatsApp redirect in a new tab/window
      let rsvpText = "";
      if (attending === "yes") {
        rsvpText = `¡Hola! Soy ${name.trim()} y confirmo mi asistencia a los 15 Años de Romina. ¡Ahí nos vemos! 🎉`;
        const companionsNum = parseInt(companions, 10);
        if (companionsNum > 0) {
          rsvpText += ` Iré con ${companionsNum} acompañante${companionsNum > 1 ? "s" : ""}.`;
        }
      } else {
        rsvpText = `¡Hola! Soy ${name.trim()}. Agradezco mucho la invitación a los 15 Años de Romina, pero lamentablemente no podré asistir. ¡Les deseo una fiesta increíble! ✨`;
      }

      const whatsappUrl = `https://wa.me/526681467587?text=${encodeURIComponent(rsvpText)}`;
      window.open(whatsappUrl, '_blank');
      
      // Reset form fields
      if (!currentPass) {
        setName("");
      }
      setAttending("");
      setCompanions("0");
      setMessage("");
    }, 800);
  };

  return (
    <section className="w-full py-24 px-6 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl mx-auto"
      >
        <span className="font-sans text-sm text-[#8C3345] uppercase tracking-widest mb-4 block font-bold">
          Confirmación
        </span>
        <h2 className="font-script text-[4rem] md:text-[6rem] text-[#E88295] mb-12 leading-tight">
          Acompáñame
        </h2>

        {currentPass && (
          <motion.div
            id="guest-pass-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-sm mx-auto bg-[#FDFBF7] p-8 rounded-2xl shadow-[0_10px_40px_rgba(140,51,69,0.15)] mb-12 border border-[#E88295]/30 relative overflow-hidden text-center"
          >
            {/* Esquinas doradas / rosas decorativas */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8C3345] rounded-tl-xl m-2"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8C3345] rounded-br-xl m-2"></div>
            
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 font-bold">Pase Especial</p>
            <h3 id="guest-name-display" className="font-script text-4xl text-[#8C3345] mb-4">
              {currentPass.guestName}
            </h3>
            <div className="w-16 h-px bg-[#E88295] mx-auto mb-4"></div>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-widest font-bold">Lugares reservados</p>
            <p id="guest-passes-display" className="font-sans text-5xl font-bold text-[#E88295] mt-2 drop-shadow-md">
              {currentPass.totalPasses}
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="rsvp-form-element-container"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relieve-3d p-8 md:p-12 rounded-[40px] text-left"
            >
              <form onSubmit={handleSubmit} className="space-y-10" id="rsvp-form">
                {/* Full Name */}
                <div>
                  <label className="font-sans text-xs text-[#8C3345] font-bold uppercase tracking-widest mb-4 block">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María Teresa Beltrán"
                    disabled={!!currentPass}
                    className={`w-full px-6 py-4 rounded-2xl hundido-3d font-sans text-sm text-[#4A4A4A] focus:outline-none placeholder-[#F3C5CE] bg-transparent ${currentPass ? 'opacity-80 cursor-not-allowed font-semibold' : ''}`}
                  />
                </div>

                {/* Attending Selection */}
                <div>
                  <label className="font-sans text-xs text-[#9D6B84] font-bold uppercase tracking-widest mb-4 block">
                    ¿Asistirás al evento?
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={attending}
                      onChange={(e) => setAttending(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl hundido-3d font-sans text-sm text-[#4A4A4A] focus:outline-none appearance-none bg-transparent cursor-pointer"
                    >
                      <option value="" className="text-[#4A4A4A] bg-[#FAF5F5]">Selecciona una opción...</option>
                      <option value="yes" className="text-[#4A4A4A] bg-[#FAF5F5]">¡Sí, asistiré con gusto!</option>
                      <option value="no" className="text-[#4A4A4A] bg-[#FAF5F5]">Lamentablemente no podré asistir</option>
                    </select>
                    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-[#9D6B84]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Number of Companions (Conditional) */}
                <AnimatePresence>
                  {attending === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <label className="font-sans text-xs text-[#9D6B84] font-bold uppercase tracking-widest mb-4 block">
                        Pases / Acompañantes adicionales
                      </label>
                      <div className="relative">
                        <select
                          value={companions}
                          onChange={(e) => setCompanions(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl hundido-3d font-sans text-sm text-[#4A4A4A] focus:outline-none appearance-none bg-transparent cursor-pointer"
                        >
                          {currentPass ? (
                            Array.from({ length: currentPass.totalPasses }, (_, index) => {
                              if (index === 0) {
                                return (
                                  <option key={index} value="0" className="text-[#4A4A4A] bg-[#FAF5F5]">
                                    Solo yo (1 pase)
                                  </option>
                                );
                              }
                              return (
                                <option key={index} value={index.toString()} className="text-[#4A4A4A] bg-[#FAF5F5]">
                                  Yo + {index} {index === 1 ? "acompañante" : "acompañantes"} ({index + 1} pases)
                                </option>
                              );
                            })
                          ) : (
                            <>
                              <option value="0" className="text-[#4A4A4A] bg-[#FAF5F5]">Solo yo (1 pase)</option>
                              <option value="1" className="text-[#4A4A4A] bg-[#FAF5F5]">Yo + 1 acompañante (2 pases)</option>
                              <option value="2" className="text-[#4A4A4A] bg-[#FAF5F5]">Yo + 2 acompañantes (3 pases)</option>
                              <option value="3" className="text-[#4A4A4A] bg-[#FAF5F5]">Yo + 3 acompañantes (4 pases)</option>
                              <option value="4" className="text-[#4A4A4A] bg-[#FAF5F5]">Yo + 4 acompañantes (5 pases)</option>
                            </>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-[#9D6B84]">
                          ▼
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Optional Congratulatory Message */}
                <div>
                  <label className="font-sans text-xs text-[#9D6B84] font-bold uppercase tracking-widest mb-4 block">
                    Mensaje o felicitación (Opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Déjale un lindo mensaje a la quinceañera..."
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl hundido-3d font-sans text-sm text-[#4A4A4A] focus:outline-none placeholder-[#F3C5CE] bg-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="boton-3d w-full py-5 rounded-2xl uppercase tracking-widest text-xs font-bold text-white transition-all disabled:opacity-50"
                  >
                    {submitting ? "Enviando..." : "Confirmar Asistencia"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="rsvp-success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relieve-3d p-12 rounded-[40px] text-center max-w-md mx-auto relative overflow-visible"
            >
              {/* Confetti Explosion Burst */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                {Array.from({ length: 30 }).map((_, i) => {
                  const angle = (i * (360 / 30) * Math.PI) / 180 + (Math.random() - 0.5) * 0.3;
                  const distance = 90 + Math.random() * 110;
                  const xTarget = Math.cos(angle) * distance;
                  const yTarget = Math.sin(angle) * distance - 20; // adjust offset towards badge
                  const size = 5 + Math.random() * 8;
                  const colors = ["#E88295", "#8C3345", "#D49A89", "#F3C5CE", "#FDFBF7"];
                  const color = colors[i % colors.length];
                  const rotation = Math.random() * 360;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: -40, scale: 0, opacity: 1, rotate: 0 }}
                      animate={{
                        x: xTarget,
                        y: yTarget,
                        scale: [0, 1.2, 0.8, 0],
                        opacity: [1, 1, 0.8, 0],
                        rotate: rotation + 360,
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 0.8,
                        ease: [0.1, 0.8, 0.3, 1],
                        delay: Math.random() * 0.1,
                      }}
                      className="absolute rounded-full"
                      style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}80`,
                        borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "50% 50% 0 0",
                      }}
                    />
                  );
                })}
              </div>

              {/* Floating Sparkles around badge */}
              <div className="absolute inset-x-0 top-6 pointer-events-none flex justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -left-12 text-[#D49A89] opacity-60"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.8, 0.3, 0.8],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute -top-2 -right-12 text-[#D49A89] opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Animated Badge Container with Spring effect and glowing halo */}
              <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 0.15 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                  className="absolute inset-0 rounded-full bg-[#D49A89]"
                  style={{ filter: "blur(8px)" }}
                />
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                    delay: 0.1,
                  }}
                  className="w-20 h-20 rounded-full hundido-3d flex items-center justify-center text-[#9D6B84] bg-[#FAF5F5] relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Beautiful Staggered Content */}
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                className="font-script text-5xl text-[#D49A89] mb-6 leading-tight"
              >
                ¡Muchas Gracias!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
                className="font-sans text-xs text-[#4A4A4A] font-bold leading-relaxed mb-10 uppercase tracking-widest"
              >
                Tu respuesta ha sido registrada. Para {quinceaneraName} es un honor contar con tu cariño.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
              >
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="boton-3d px-8 py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                >
                  Enviar otra confirmación
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
