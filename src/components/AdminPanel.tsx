import React, { useState } from "react";
import { X, Check, Copy, Share2, Trash2 } from "lucide-react";
import { InvitationConfig, PassEntry, RsvpEntry, GuestBookEntry } from "../types";

interface AdminPanelProps {
  config: InvitationConfig;
  onUpdateConfig: (newConfig: InvitationConfig) => void;
  rsvpList: RsvpEntry[];
  onClearRsvps: () => void;
  onRemoveRsvp: (id: string) => void;
  passesList: PassEntry[];
  onAddPass: (newPass: PassEntry) => void;
  onRemovePass: (id: string) => void;
  guestBookEntries?: GuestBookEntry[];
  onRemoveGuestBookEntry?: (id: string) => void;
  onClose?: () => void;
}

export default function AdminPanel({
  config,
  passesList = [],
  onAddPass,
  onRemovePass,
  onClose,
}: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [totalPasses, setTotalPasses] = useState<string>("");
  const [linkResult, setLinkResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Helper to slugify guest names for cleaner invite URLs
  const getSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const createPassEntry = (): PassEntry | null => {
    if (!guestName.trim()) {
      alert("Por favor, ingresa el nombre del invitado.");
      return null;
    }
    const numPasses = parseInt(totalPasses, 10);
    if (isNaN(numPasses) || numPasses <= 0) {
      alert("Por favor, ingresa un número de pases válido.");
      return null;
    }

    const cleanName = getSlug(guestName);
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const passId = `${cleanName || "invitado"}-${randomSuffix}`;

    const newPass: PassEntry = {
      id: passId,
      guestName: guestName.trim(),
      totalPasses: numPasses,
    };

    onAddPass(newPass);
    return newPass;
  };

  const buildPassUrl = (passId: string, name: string, pases: number): string => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
    return `${currentOrigin}${currentPath}?pase=${passId}&name=${encodeURIComponent(name)}&pases=${pases}`;
  };

  const handleCopyLink = () => {
    let url = linkResult;
    if (!url) {
      const newPass = createPassEntry();
      if (!newPass) return;
      url = buildPassUrl(newPass.id, newPass.guestName, newPass.totalPasses);
      setLinkResult(url);
    }

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Error al copiar el enlace", err);
    });
  };

  const handleSendWhatsapp = () => {
    let url = linkResult;
    let numPasses = parseInt(totalPasses, 10);
    let finalGuestName = guestName.trim();

    if (!url) {
      const newPass = createPassEntry();
      if (!newPass) return;
      url = buildPassUrl(newPass.id, newPass.guestName, newPass.totalPasses);
      setLinkResult(url);
      numPasses = newPass.totalPasses;
      finalGuestName = newPass.guestName;
    }

    const message = `¡Hola *${finalGuestName}*! Nos complace invitarte cordialmente a celebrar los 15 años de ${config.name}. Te compartimos tu pase digital personalizado con acceso para *${numPasses}* ${numPasses === 1 ? "persona" : "personas"} en el siguiente enlace:\n\n${url}\n\n¡Esperamos contar con tu presencia!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleClearInputs = () => {
    setGuestName("");
    setTotalPasses("");
    setLinkResult("");
  };

  return (
    <>
      {/* Sliding Bottom Drawer / Admin Panel */}
      {isOpen && (
        <div
          id="admin-panel"
          className="fixed bottom-0 inset-x-0 bg-white p-6 z-[10000] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl border-t-4 border-[#9D6B84] transition-all duration-500 ease-out font-sans overflow-y-auto max-h-[85vh]"
        >
          <div className="max-w-md mx-auto relative pt-4">
            <h3 className="font-sans font-bold text-[#9D6B84] mb-4 uppercase text-xs tracking-widest text-center">
              Panel Exclusivo - Generador de Pases
            </h3>

            <div className="space-y-3">
              {/* Guest name input */}
              <input
                type="text"
                id="admin-invitado"
                placeholder="Nombre (Ej. Familia López)"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  setLinkResult(""); // Reset output if name changes
                }}
                className="w-full p-3 border border-pink-100/50 rounded-xl font-sans text-sm focus:outline-none focus:border-[#9D6B84] bg-[#FAF5F5] text-gray-700 placeholder-gray-400"
              />

              {/* Number of passes input */}
              <input
                type="number"
                id="admin-pases"
                placeholder="Número de pases (Ej. 4)"
                value={totalPasses}
                onChange={(e) => {
                  setTotalPasses(e.target.value);
                  setLinkResult(""); // Reset output if pases changes
                }}
                className="w-full p-3 border border-pink-100/50 rounded-xl font-sans text-sm focus:outline-none focus:border-[#9D6B84] bg-[#FAF5F5] text-gray-700 placeholder-gray-400"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 border-2 border-[#9D6B84] text-[#9D6B84] p-3 rounded-xl uppercase text-[10px] font-bold tracking-widest hover:bg-[#9D6B84] hover:text-white transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "¡Copiado!" : "Copiar Link"}
                </button>

                <button
                  onClick={handleSendWhatsapp}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl uppercase text-[10px] font-bold tracking-widest shadow-lg transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Enviar al Invitado
                </button>
              </div>

              {/* Clear fields action */}
              {(guestName || totalPasses || linkResult) && (
                <button
                  onClick={handleClearInputs}
                  className="w-full text-center text-[10px] uppercase font-semibold text-gray-400 hover:text-gray-600 pt-1 tracking-wider cursor-pointer"
                >
                  Limpiar campos
                </button>
              )}

              {/* Link result box */}
              {linkResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center animate-fade-in">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Enlace Generado:</p>
                  <p id="admin-link-result" className="text-[10px] break-all text-[#9D6B84] font-mono select-all font-medium">
                    {linkResult}
                  </p>
                </div>
              )}
            </div>

            {/* Existing passes list/history (collapsible & super compact) */}
            {passesList.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#9D6B84] transition-colors cursor-pointer"
                >
                  <span>Ver Pases Generados ({passesList.length})</span>
                  <span>{showHistory ? "Ocultar" : "Mostrar"}</span>
                </button>

                {showHistory && (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-1">
                    {passesList.map((pass) => {
                      const passUrl = buildPassUrl(pass.id, pass.guestName, pass.totalPasses);
                      return (
                        <div key={pass.id} className="flex items-center justify-between p-2 bg-gray-50/70 rounded-lg border border-gray-100 text-[10px]">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-700 truncate">{pass.guestName}</p>
                            <p className="text-[9px] text-gray-400 font-mono">
                              {pass.totalPasses} {pass.totalPasses === 1 ? "pase" : "pases"} &bull; {pass.id}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(passUrl);
                                alert(`Enlace de ${pass.guestName} copiado.`);
                              }}
                              className="p-1 hover:text-[#9D6B84] text-gray-400 transition cursor-pointer"
                              title="Copiar enlace"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar pase para ${pass.guestName}?`)) {
                                  onRemovePass(pass.id);
                                }
                              }}
                              className="p-1 hover:text-red-500 text-gray-400 transition cursor-pointer"
                              title="Eliminar pase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold min-h-[40px] w-10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar panel"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
