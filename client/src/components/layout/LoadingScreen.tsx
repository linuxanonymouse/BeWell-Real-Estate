"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingTexts = [
  "Preparing Your Experience",
  "Constructing Excellence",
  "Building Your Future",
];

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle text every 1.5 seconds
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 45); // ~4.5 seconds total loading time

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
        >
          {/* Sunrise Atmosphere Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#c28751]/20 via-transparent to-transparent opacity-60" />
          
          {/* Dust Particles Overlay (CSS animated) */}
          <div className="absolute inset-0 pointer-events-none dust-particles" />

          {/* Logo Reveal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-12 relative z-10"
          >
            <h1 className="text-4xl font-display tracking-widest uppercase text-primary-300">
              BeWell
            </h1>
          </motion.div>

          {/* Text Cycling */}
          <div className="h-8 relative w-full flex justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="absolute text-sm tracking-[0.2em] uppercase text-gray-400"
              >
                {loadingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-20 w-64 h-[1px] bg-white/20 z-10">
            <motion.div
              className="h-full bg-primary-400"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          
          <div className="absolute bottom-12 text-xs text-gray-500 font-mono z-10">
            {progress.toString().padStart(3, '0')}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
