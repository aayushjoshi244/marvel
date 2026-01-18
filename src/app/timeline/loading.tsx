"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { use, useEffect, useState } from "react";

const QUOTES = [
  "Whatever it takes.",
  "I can do this all day",
  "We have hulk",
  "I love you 3000",
  "I'm Iron Man",
  "With Great Power, CComes Great Responsibility",
  "The hardest choices require the strongest wills.",
  "Bring me Thanos!",
  "Wakanda forever!",
  "Avengers Assemble!",
  "No amount of money ever bought a second of time.",
  "Everything I do, I do it to protect the people I love.",
  "Everybody wants a happy ending, right? But it doesn't always roll that way. Maybe this time. I’m hoping if you play this back, it’s in celebration.",
];

export default function Loading() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setP((v) => (v >= 100 ? 100 : v + 3)), 60);
    return () => clearInterval(t);
  }, []);

  const quote =
    QUOTES[Math.min(QUOTES.length - 1, Math.floor((p / 100) * QUOTES.length))];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 h-14 w-14 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
            <span className="text-lg font-semibold tracking-widest text-white/90">
              MJ
            </span>
          </div>

          <h1 className="text-2xl font-semibold">Preparing your journey</h1>
          <p className="mt-2 text-sm text-white/60">{quote}</p>

          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-red-600"
              initial={{ width: "0%" }}
              animate={{ width: `${p}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-white/50">
            <span>Loading Timeline</span>
            <span>{p}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
