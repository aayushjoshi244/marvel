"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { type Title } from "@/data/titles";
import { NebulaBackground } from "./NebulaBackground";
import { CosmicPath, CosmicPathGlow } from "./CosmicPath";
import { MovieNode } from "./MovieNode";
import { PHASES, type PhaseSection } from "@/data/phases";
import { PhaseBackground } from "./PhaseBackground";

interface JourneySceneProps {
  titles: Title[];
  watched: Record<string, boolean>;
  currentOrder: number;
  onNodeClick: (t: Title) => void;
  onLockedClick: () => void;
  started: boolean;
}

// Helper to get spiral point
function getSpiralPoint(t: number, radius: number = 10) {
  const angle = t; 
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return new THREE.Vector3(x, y, 0); // Z will be set by the layout
}

function SceneContent({
  titles,
  watched,
  currentOrder,
  onNodeClick,
  onLockedClick,
  started,
}: JourneySceneProps) {
  const scroll = useScroll();

  // We need to pre-calculate the layout to know where everything is.
  const { curve, titlePositions, phaseDecorations, totalLength } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const titlePos: { id: string; pos: THREE.Vector3 }[] = [];
    const phaseDecos: { phase: PhaseSection; pos: THREE.Vector3 }[] = [];

    const radius = 12;
    const heightStep = 5; // Vertical distance per item
    const angleStep = 0.6; // Radians per item
    const phaseGap = 30; // Gap between phases

    let currentZ = 0;
    let currentAngle = 0;

    // Start padding
    pts.push(new THREE.Vector3(0, 0, 10));
    pts.push(new THREE.Vector3(0, 0, 0));

    PHASES.forEach((phase) => {
      const phaseTitles = titles.filter(phase.filter);
      if (phaseTitles.length === 0) return;

      // Start of phase
      const phaseStartZ = currentZ;

      // Place background approx in the middle of where this phase will be
      // We don't know exact length yet, but we can estimate: length * heightStep
      // But we are building it sequentially.
      
      phaseTitles.forEach((t: Title) => {
        currentZ -= heightStep;
        currentAngle += angleStep;

        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius;
        const p = new THREE.Vector3(x, y, currentZ);
        
        pts.push(p);
        titlePos.push({ id: t.id, pos: p });
      });

      // End of phase
      const phaseEndZ = currentZ;
      const phaseCenterZ = (phaseStartZ + phaseEndZ) / 2;
      
      phaseDecos.push({
        phase,
        pos: new THREE.Vector3(0, 0, phaseCenterZ),
      });

      // Gap after phase
      currentZ -= phaseGap;
      // Add a couple of points in the gap to keep the curve smooth? 
      // Or just letting the spline handle it (might cut through center)
      // Let's add an intermediate point to guide the camera nicely through the void
      // spiraling a bit or straight? Straight is safer for "warp" feel.
      pts.push(new THREE.Vector3(0, 0, currentZ + (phaseGap/2))); 
    });

    // End padding
    pts.push(new THREE.Vector3(0, 0, currentZ - 20));

    const c = new THREE.CatmullRomCurve3(pts);
    return { 
        curve: c, 
        titlePositions: titlePos, 
        phaseDecorations: phaseDecos, 
        totalLength: Math.abs(currentZ) 
    };
  }, [titles]);

  useFrame((state, delta) => {
    // If not started, slow float or static
    if (!started) {
       // Optional: slow rotation or drift
       return; 
    }

    // scroll.offset (0..1) mapping to the curve
    const t = scroll.offset;
    
    // Safety check
    if (t < 0 || t > 1) return;

    const point = curve.getPoint(t);
    
    // Camera move logic
    const cameraOffset = new THREE.Vector3(0, 4, 12);
    const cameraPos = point.clone().add(cameraOffset);
    
    state.camera.position.lerp(cameraPos, 0.1);
    
    const lookAtT = Math.min(t + 0.02, 1);
    const lookAtPoint = curve.getPoint(lookAtT);
    state.camera.lookAt(lookAtPoint);
  });

  return (
    <>
import { NebulaBackground } from "./NebulaBackground";

// ... (in SceneContent return)
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <NebulaBackground />
      <CosmicPath curve={curve} />
      <CosmicPathGlow curve={curve} />

      {/* Render Phase Backgrounds */}
      {phaseDecorations.map((pd) => (
        <PhaseBackground 
            key={pd.phase.key}
            position={pd.pos}
            imageUrl={pd.phase.bg}
            title={pd.phase.title}
            subtitle={pd.phase.subtitle}
        />
      ))}

      {/* Render Nodes */}
      {titlePositions.map(({ id, pos }) => {
        const title = titles.find(t => t.id === id);
        if (!title) return null;

        const isWatched = !!watched[title.id];
        let status: "watched" | "next" | "locked" = "locked";
        if (isWatched) status = "watched";
        else if (title.recommendedOrder === currentOrder) status = "next";

        return (
          <MovieNode
            key={id}
            title={title}
            position={pos}
            status={status}
            onClick={(t) => {
               if (status === 'locked') onLockedClick();
               else onNodeClick(t);
            }}
          />
        );
      })}
    </>
  );
}

export default function JourneyScene(props: JourneySceneProps) {
  // Approximate pages: total items / 5 items per screen height roughly
  // Adjust based on feel.
  const pageCount = Math.max(2, props.titles.length / 4);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 5, 10], fov: 60, far: 2000 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 120]} />
        <ScrollControls pages={pageCount} damping={0.3} enabled={props.started}>
             <Suspense fallback={null}>
                <SceneContent {...props} />
             </Suspense>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
