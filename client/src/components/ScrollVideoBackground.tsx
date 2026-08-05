"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

export default function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const introFinished = useRef(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastReverseTime = useRef(0);
  const INTRO_DURATION = 5.0;

  useLenis((lenis) => {
    const video = videoRef.current;
    if (!video || !isReady || !introFinished.current) return;
    if (isNaN(video.duration) || video.duration === 0) return;

    if (!video.paused) {
      video.pause();
    }

    const progress = lenis.progress;
    const safeDuration = video.duration - 0.5;
    const targetTime = INTRO_DURATION + progress * (safeDuration - INTRO_DURATION);

    // With an All-Intra MP4, we can set currentTime directly every tick 
    // at 60fps and it will be perfectly smooth in both directions.
    video.currentTime = targetTime;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = async () => {
      setIsReady(true);
      try {
        video.currentTime = 0;
        video.playbackRate = 1;
        await video.play();

        const checkIntro = () => {
          if (introFinished.current) return;
          if (video.currentTime >= INTRO_DURATION) {
            video.pause();
            introFinished.current = true;
          } else {
            requestAnimationFrame(checkIntro);
          }
        };
        requestAnimationFrame(checkIntro);
      } catch (err) {
        introFinished.current = true;
      }
    };

    const handleEarlyScroll = () => {
      if (window.scrollY > 10 && !introFinished.current) {
        introFinished.current = true;
        if (!video.paused) video.pause();
        window.removeEventListener("scroll", handleEarlyScroll);
      }
    };
    window.addEventListener("scroll", handleEarlyScroll, { passive: true });

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.onloadedmetadata = onReady;
    }

    return () => {
      window.removeEventListener("scroll", handleEarlyScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#0d0a08]">
      <div className={`w-full h-full transition-opacity duration-1000 ${isReady ? 'opacity-80' : 'opacity-0'}`}>
        <video
          ref={videoRef}
          src="/b-well-intra.mp4"
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      </div>
      <div className="absolute inset-0 bg-[#0d0a08]/20 pointer-events-none mix-blend-multiply" />
    </div>
  );
}
