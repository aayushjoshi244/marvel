"use client";

import { Image, Text } from "@react-three/drei";
import * as THREE from "three";

interface PhaseBackgroundProps {
  position: THREE.Vector3;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export function PhaseBackground({ position, imageUrl, title, subtitle }: PhaseBackgroundProps) {
  return (
    <group position={position}>
      {/* Large background poster */}
      <Image
        url={imageUrl}
        scale={[70, 45]}
        transparent
        opacity={0.15}
        position={[-35, 0, -15]} // To the left side
        rotation={[0, Math.PI / 6, 0]} // Angled towards center
        grayscale={0.6}
      />
      
      {/* Phase Title */}
      <Text
        position={[-25, 12, -10]}
        rotation={[0, Math.PI / 6, 0]}
        fontSize={5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000"
        fillOpacity={0.9}
      >
        {title.toUpperCase()}
      </Text>

      {/* Subtitle */}
      <Text
        position={[-25, 8, -10]}
        rotation={[0, Math.PI / 6, 0]}
        fontSize={1.2}
        color="#ffffffcc"
        anchorX="center"
        anchorY="middle"
        maxWidth={25}
        textAlign="center"
      >
        {subtitle}
      </Text>
    </group>
  );
}
