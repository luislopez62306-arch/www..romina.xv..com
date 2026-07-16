import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, PenTool, Sparkles, Smile, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GuestBookEntry } from "../types";

interface GuestBookProps {
  entries: GuestBookEntry[];
  onAddEntry: (entry: GuestBookEntry) => void;
  defaultGuestName?: string;
}

const DESIGN_PRESETS = [
  {
    bg: "bg-[#FDFBF7] border-[#D49A89]/30 text-gray-700",
    header: "text-[#9D6B84]",
    accent: "text-[#D49A89]",
    badge: "bg-[#D49A89]/10 text-[#D49A89]",
    style: "rounded-3xl shadow-md border"
  },
  {
    bg: "bg-[#FAF5F5] border-[#9D6B84]/20 text-gray-700",
    header: "text-[#9D6B84]",
    accent: "text-[#D49A89]",
    badge: "bg-[#D49A89]/10 text-[#D49A89]",
    style: "rounded-2xl shadow-lg border"
  },
  {
    bg: "bg-white border-gray-200 text-gray-700",
    header: "text-gray-800",
    accent: "text-rose-400",
    badge: "bg-rose-50 text-rose-500",
    style: "rounded-xl shadow-sm border"
  },
  {
    bg: "bg-[#FCF7F2] border-[#D49A89]/20 text-gray-700",
    header: "text-[#9D6B84]",
    accent: "text-[#D49A89]",
    badge: "bg-[#D49A89]/10 text-[#D49A89]",
    style: "rounded-3xl shadow-lg border-2 border-dashed"
  }
];

export default function GuestBook({ entries, onAddEntry, defaultGuestName }: GuestBookProps) {
  const [name, setName] = useState(defaultGuestName || "");
  const [message, setMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [success, setSuccess] = useState(false);

  // Sync default guest name if it loads later
  useEffect(() => {
    if (defaultGuestName) {
      setName(defaultGuestName);
    }
  }, [defaultGuestName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newEntry: GuestBookEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }),
      designIndex: selectedPreset
    };

    onAddEntry(newEntry);
    setMessage("");
    if (!defaultGuestName) {
      setName("");
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const emojis = ["✨", "💖", "🌸", "👑", "🎉", "💐", "🥳", "💫", "🎂", "🦄"];

  const filteredEntries = entries.filter((entry) =>
    entry.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    entry.message.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section id="libro-visitas" className="w-full py-24 px-6 bg-[#FAF5F5] text-center relative overflow-hidden">
      {/* Decorative starry patterns background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h2 className="font-montserrat text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-4 font-bold">
          Dedicatorias Especiales
        </h2>
        <p className="font-script text-[4rem] md:text-[6rem] text-[#9D6B84] mb-4 leading-none">
          Libro de Visitas
        </p>
        <p className="font-montserrat text-xs md:text-sm text-gray-500 max-w-lg mx-auto mb-16 leading-relaxed font-medium">
          Deja un lindo mensaje, felicitación o tus mejores deseos para Romina en este día tan mágico e inolvidable.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left items-start">
          
          {/* LEFT: Elegant Write Form */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-[#D49A89]/20 relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#EBBAB9] to-[#9D6B84] rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
              <PenTool className="w-5 h-5" />
            </div>

            <h3 className="font-montserrat text-xs md:text-sm text-[#9D6B84] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              Escribir Dedicatoria <Sparkles className="w-4 h-4 text-[#D49A89]" />
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="font-montserrat block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Familia López"
                  className="font-montserrat w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#D49A89] transition text-sm text-gray-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-montserrat block text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Mensaje o Deseo
                  </label>
                  <span className={`text-[9px] font-sans ${message.length > 180 ? "text-red-400 font-bold" : "text-gray-400"}`}>
                    {message.length}/200
                  </span>
                </div>
                
                <textarea
                  required
                  maxLength={200}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu bendición o felicitación aquí..."
                  className="font-montserrat w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-[#D49A89] transition text-sm text-gray-700 resize-none leading-relaxed"
                />
              </div>

              {/* Emoji quick selection */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-montserrat uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-gray-400" /> Emojis:
                </span>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      if (message.length + emoji.length <= 200) {
                        setMessage((prev) => prev + emoji);
                      }
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAF5F5] transition text-sm hover:scale-110"
                    title="Insertar emoji"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Card Style selection */}
              <div className="pt-2">
                <label className="font-montserrat block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">
                  Estilo de Tarjeta
                </label>
                <div className="flex gap-2">
                  {DESIGN_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPreset(idx)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${preset.bg} ${
                        selectedPreset === idx ? "border-[#9D6B84] scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={`Estilo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="font-montserrat w-full bg-[#9D6B84] text-white hover:bg-[#8C3345] px-6 py-4 uppercase tracking-widest text-[11px] font-bold transition duration-300 shadow-md hover:shadow-xl rounded-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white" />
                Publicar Mensaje
              </button>
            </form>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-x-8 bottom-4 bg-[#9D6B84] text-white py-2 px-4 rounded-xl text-xs text-center font-bold tracking-wider font-montserrat shadow-lg"
                >
                  ¡Gracias! Tu mensaje ha sido publicado ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Scrollable Guestbook Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h3 className="font-montserrat text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9D6B84]" /> Notas Compartidas ({entries.length})
              </h3>

              {/* Simple filter search */}
              <input
                type="text"
                placeholder="Buscar nota por nombre..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="font-montserrat text-xs bg-white border border-gray-200 px-4 py-2.5 rounded-full focus:outline-none focus:border-[#D49A89] text-gray-700 w-full sm:w-64 shadow-xs"
              />
            </div>

            {/* Scrollable list container */}
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200" id="guestbook-list">
              <AnimatePresence mode="popLayout">
                {filteredEntries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/80 p-12 rounded-3xl border border-gray-100 text-center text-gray-400 font-montserrat text-xs font-semibold leading-relaxed"
                  >
                    {filterQuery 
                      ? "No se encontraron mensajes con ese criterio de búsqueda." 
                      : "Sé el primero en dejar un hermoso deseo para Romina 🌸"}
                  </motion.div>
                ) : (
                  filteredEntries.map((entry) => {
                    const preset = DESIGN_PRESETS[entry.designIndex] || DESIGN_PRESETS[0];
                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className={`p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${preset.bg} ${preset.style}`}
                      >
                        {/* Decorative watermark / quote icon */}
                        <span className="absolute right-4 bottom-2 text-7xl font-serif text-gray-200/25 pointer-events-none select-none">
                          ”
                        </span>

                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h4 className={`font-script text-3xl md:text-4xl ${preset.header} leading-none capitalize`}>
                            {entry.name}
                          </h4>
                          <span className={`font-montserrat text-[8px] uppercase tracking-wider px-2 py-1 rounded-full ${preset.badge} flex items-center gap-1 font-bold`}>
                            <Clock className="w-2.5 h-2.5" />
                            {entry.timestamp}
                          </span>
                        </div>

                        <p className="font-montserrat text-xs md:text-sm text-gray-600 leading-relaxed font-medium relative z-10 whitespace-pre-line">
                          {entry.message}
                        </p>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
