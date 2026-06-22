"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Building() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Rotate slowly for cinematic effect
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (materialRef.current) {
      // Subtle color shift
      materialRef.current.emissiveIntensity = Math.abs(Math.sin(state.clock.elapsedTime * 0.5)) * 0.2;
    }
  });

  // Procedural geometry parameters
  const floors = 40;
  const radius = 5;
  
  const floorElements = useMemo(() => {
    const elements = [];
    for (let i = 0; i < floors; i++) {
      const scaleY = i === 0 ? 1.5 : 1; // Lobby is taller
      const yPos = i * 1.1; // floor height
      // slightly taper at the top
      const scaleX = radius * (1 - (i / floors) * 0.2); 
      
      elements.push(
        <mesh key={i} position={[0, yPos, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[scaleX, scaleX, scaleY, 32]} />
          <meshPhysicalMaterial
            ref={i === 0 ? materialRef : undefined}
            color="#050505"
            metalness={0.9}
            roughness={0.1}
            transmission={0.5} // glass-like
            ior={1.5}
            thickness={2}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#b57041"
            emissiveIntensity={0.05}
          />
        </mesh>
      );

      // Add "balcony" rings
      if (i > 0 && i % 2 === 0) {
        elements.push(
          <mesh key={`ring-${i}`} position={[0, yPos, 0]} receiveShadow>
            <cylinderGeometry args={[scaleX + 0.3, scaleX + 0.3, 0.1, 32]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.4} />
          </mesh>
        );
      }
    }
    return elements;
  }, []);

  return (
    <group ref={groupRef} position={[0, -10, 0]}>
      {floorElements}
      
      {/* Ground plane to catch reflections/shadows */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#020202" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  );
}
