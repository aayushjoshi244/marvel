"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, useScroll } from "@react-three/drei";

type Props = {
  // Where to place the reveal in 3D space (ideally near your last node)
  position: [number, number, number];
  // Use either mp4 video texture OR YouTube embed.
  mp4Src?: string;        // e.g. "/doomsday.mp4"
  youtubeEmbedUrl?: string; // e.g. "https://www.youtube.com/embed/XXXX?autoplay=1&mute=0"
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export default function DoomsdayReveal({ position, mp4Src, youtubeEmbedUrl }: Props) {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  // This is the *last* scroll page we added.
  // We’ll reveal over the final ~20% of total scroll.
  const revealStart = 0.82; // start revealing near the end
  const revealLen = 0.18;   // length of reveal segment

  // --- Video texture (MP4) option ---
  const videoEl = useMemo(() => {
    if (!mp4Src) return null;
    const v = document.createElement("video");
    v.src = mp4Src;
    v.crossOrigin = "anonymous";
    v.loop = true;
    v.muted = false;
    v.playsInline = true;
    v.preload = "auto";
    return v;
  }, [mp4Src]);

  const videoTex = useMemo(() => {
    if (!videoEl) return null;
    const tex = new THREE.VideoTexture(videoEl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [videoEl]);

  useEffect(() => {
    if (!videoEl) return;

    // Only attempt to play once we’re in the reveal region,
    // because autoplay rules can block play until user interaction.
    return () => {
      videoEl.pause();
      videoEl.src = "";
    };
  }, [videoEl]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    // scroll.offset is 0..1
    const t = clamp01((scroll.offset - revealStart) / revealLen);

    // cinematic reveal: fade + scale + slight float
    g.visible = t > 0.001;
    g.scale.setScalar(0.85 + 0.25 * t);
    g.position.y = position[1] + (1 - t) * -0.35;
    (g as any).userData.t = t;

    // If using MP4, try to play when reveal starts
    if (videoEl && t > 0.05 && videoEl.paused) {
      videoEl.play().catch(() => {
        // autoplay might be blocked; user gesture will fix it
      });
    }
  });

  return (
    <group ref={group} position={position} visible={false}>
      {/* Title */}
      <Text
        fontSize={0.28}
        letterSpacing={0.06}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.55, 0]}
      >
        DOOMSDAY COUNTDOWN
        <meshStandardMaterial emissiveIntensity={1.2} />
      </Text>

      {/* Glow plate behind video */}
      <mesh position={[0, 0.05, -0.05]}>
        <planeGeometry args={[3.6, 2.05]} />
        <meshStandardMaterial
          transparent
          opacity={0.25}
          emissiveIntensity={1.4}
        />
      </mesh>

      {/* --- Option A: MP4 Video in 3D (best “true 3D reveal” feel) --- */}
      {videoTex ? (
        <mesh position={[0, 0.05, 0]}>
          <planeGeometry args={[3.2, 1.8]} />
          <meshBasicMaterial map={videoTex} toneMapped={false} />
        </mesh>
      ) : null}

      {/* --- Option B: YouTube embed pinned in 3D (simple, but it’s HTML) --- */}
      {!videoTex && youtubeEmbedUrl ? (
        <Html transform occlude position={[0, 0.05, 0]} distanceFactor={1.2}>
          <div
            style={{
              width: 800,
              height: 450,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.6)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <iframe
              width="800"
              height="450"
              src={youtubeEmbedUrl}
              title="Doomsday Countdown"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </Html>
      ) : null}

      {/* Small helper text */}
      <Text
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        position={[0, -1.05, 0]}
      >
        Scroll finished. The end begins.
      </Text>
    </group>
  );
}
