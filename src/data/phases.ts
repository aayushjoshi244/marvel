import { type Title } from "./titles";

export type PhaseKey =
  | "UNSORTED"
  | "PHASE_1"
  | "PHASE_2"
  | "PHASE_3"
  | "PHASE_4"
  | "PHASE_5"
  | "PHASE_6";

export type PhaseSection = {
  key: PhaseKey;
  title: string;
  subtitle: string;
  bg: string;
  filter: (t: Title) => boolean;
};

export const PHASES: PhaseSection[] = [
  {
    key: "UNSORTED",
    title: "Prologue",
    subtitle: "The essentials before the saga locks in.",
    bg: "/journey/unsorted.jpg",
    filter: (t) => !t.phase || t.phase === 0,
  },
  {
    key: "PHASE_1",
    title: "Phase 1",
    subtitle: "The origin spark.",
    bg: "/journey/phase-1.jpg",
    filter: (t) => t.phase === 1,
  },
  {
    key: "PHASE_2",
    title: "Phase 2",
    subtitle: "The world expands.",
    bg: "/journey/phase-2.jpg",
    filter: (t) => t.phase === 2,
  },
  {
    key: "PHASE_3",
    title: "Phase 3",
    subtitle: "The war for everything.",
    bg: "/journey/phase-3.jpg",
    filter: (t) => t.phase === 3,
  },
  {
    key: "PHASE_4",
    title: "Phase 4",
    subtitle: "The multiverse booms",
    bg: "/journey/phase-4.jpg",
    filter: (t) => t.phase === 4,
  },
  {
    key: "PHASE_5",
    title: "Phase 5",
    subtitle: "The multiversal icidents.",
    bg: "/journey/phase-5.jpg",
    filter: (t) => t.phase === 5,
  },
  {
    key: "PHASE_6",
    title: "Phase 6",
    subtitle: "The doom effect comming.",
    bg: "/journey/phase-6.jpg",
    filter: (t) => t.phase === 6,
  },
];
