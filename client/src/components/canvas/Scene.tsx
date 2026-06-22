"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Building from "./Building";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    if (!cameraRef.current) return;

    // Set initial position
    cameraRef.current.position.set(0, 5, 40);

    // GSAP Scroll Animations for Camera
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
      },
    });

    // Scene 1: Move closer to building
    tl.to(cameraRef.current.position, {
      y: 15,
      z: 20,
      ease: "power1.inOut",
    }, 0);

    // Scene 2: Rotate around and look down slightly
    tl.to(cameraRef.current.position, {
      x: 15,
      z: 15,
      ease: "power2.inOut",
    }, 1);

    // Scene 3: Pull back for the grand finale
    tl.to(cameraRef.current.position, {
      x: 0,
      y: 30,
      z: 50,
      ease: "power2.inOut",
    }, 2);
    
    // Look at center
    tl.eventCallback("onUpdate", () => {
      cameraRef.current?.lookAt(0, 10, 0);
    });

  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera ref={cameraRef} makeDefault fov={45} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={2} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
          />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#c28751" />
          
          <Building />
          
          <ContactShadows position={[0, -10.5, 0]} opacity={0.4} scale={50} blur={2} far={10} />
        </Suspense>
      </Canvas>
    </div>
  );
}
