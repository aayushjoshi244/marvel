"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Cloud, Stars, Sparkles } from "@react-three/drei";

export function NebulaBackground() {
  return (
    <group>
      {/* Deep Space Stars - Intense and colorful */}
      <Stars radius={200} depth={50} count={8000} factor={6} saturation={1} fade speed={0.5} />
      
      {/* Color Overlay Global */}
       <mesh>
           <sphereGeometry args={[300, 32, 32]} />
           <meshBasicMaterial color="#0f0c29" side={THREE.BackSide} />
       </mesh>

      {/* Floating Sparkles (simulating cosmic dust) */}
      <Sparkles 
        count={500} 
        scale={[150, 150, 150]} 
        size={8} 
        speed={0.2} 
        opacity={0.8} 
        color="#a855f7" 
      />
       <Sparkles 
        count={300} 
        scale={[120, 120, 120]} 
        size={12} 
        speed={0.1} 
        opacity={0.6} 
        color="#38bdf8" 
      />
       <Sparkles 
        count={100} 
        scale={[50, 50, 100]} 
        size={20} 
        speed={0.05} 
        opacity={1} 
        color="#f472b6" 
      />

      {/* Volumetric Clouds / Nebula feeling - Dense and Vibrant */}
      <group position={[0, -20, -50]}>
         <Cloud opacity={0.5} speed={0.2} bounds={[60, 40, 40]} segments={20} color="#5b21b6" volume={10} /> {/* Deep Violet */}
      </group>
      <group position={[50, 30, -70]}>
         <Cloud opacity={0.4} speed={0.2} bounds={[50, 30, 30]} segments={15} color="#1e40af" volume={15} /> {/* Royal Blue */}
      </group>
      <group position={[-50, 10, -50]}>
         <Cloud opacity={0.4} speed={0.2} bounds={[50, 30, 30]} segments={15} color="#be123c" volume={12} /> {/* Rose Red */}
      </group>
      <group position={[0, 50, -30]}>
          <Cloud opacity={0.3} speed={0.1} bounds={[60, 20, 30]} segments={10} color="#0e7490" volume={8} /> {/* Cyan */}
      </group>

      {/* A distant "core" glow - Watcher's Eye vibe */}
       <mesh position={[0, 20, -120]}>
           <sphereGeometry args={[60, 64, 64]} />
           <meshBasicMaterial color="#4f46e5" transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
       </mesh>
       <mesh position={[0, 20, -120]}>
           <sphereGeometry args={[30, 32, 32]} />
           <meshBasicMaterial color="#e879f9" transparent opacity={0.6} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
       </mesh>
    </group>
  );
}
