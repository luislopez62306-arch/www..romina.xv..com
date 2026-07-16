import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getCleanUrl } from "../types";

interface AudioPlayerProps {
  musicUrl: string;
  shouldPlay: boolean;
}

export default function AudioPlayer({ musicUrl, shouldPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const cleanMusicUrl = getCleanUrl(
    musicUrl,
    "https://www.dropbox.com/scl/fi/rtu43j0s084gboiwewzsr/Taylor-Swift-Daylight-Official-Audio.mp3?rlkey=afz3iwf1hxeg3r4tcddz4ywx4&st=kwc0uj1h&raw=1"
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = cleanMusicUrl;
      audioRef.current.load();
      if (shouldPlay) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setErrorOccurred(false);
          })
          .catch((err) => {
            console.log("Auto-play prevented by browser policy, waiting for direct user click.", err);
            setIsPlaying(false);
          });
      }
    }
  }, [cleanMusicUrl]);

  // Handle sudden change in shouldPlay from parent
  useEffect(() => {
    if (shouldPlay && audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setErrorOccurred(false);
        })
        .catch((err) => {
          console.log("Audio play failed on shouldPlay change", err);
        });
    }
  }, [shouldPlay]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setErrorOccurred(false);
        })
        .catch((err) => {
          console.error("Failed to play audio:", err);
          setErrorOccurred(true);
        });
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto" className="hidden" id="bg-music">
        <source src={musicUrl} type="audio/mpeg" />
      </audio>

      <AnimatePresence>
        {shouldPlay && (
          <motion.button
            id="music-toggle-btn"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            onClick={togglePlayback}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full boton-3d text-white flex items-center justify-center transition-transform hover:scale-105 duration-300 focus:outline-none"
            title={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? (
              <svg id="icon-pause" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg id="icon-play" className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}

            {/* Ripple effect when playing */}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border border-blush/20 animate-ping pointer-events-none" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
