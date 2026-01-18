export type TitleType = "film" | "show" | "oneShot" | "special" | "short";

export type Title ={
    id: string;
    name:string;
    type: TitleType;
    saga?: "Infinity" | "Multiverse" | "legacy";
    phase?: 1 | 2 | 3 | 4 | 5 | 6;
    universe: string;
    recommendedOrder: number;
    posterSrc: string;
    backdropSrc?: string;
    trailerMutedPreviewSrc?: string;
    watchLinks?: {lavbel : string, url: string}[];
};

export const titles: Title[] = [
  {
    id: "iron-man",
    name: "Iron Man",
    type: "film",
    saga: "Infinity",
    phase: 1,
    universe: "Earth-616",
    recommendedOrder: 1,
    posterSrc: "/posters/ironman.jpg",
    trailerMutedPreviewSrc: "/trailers/ironman-preview.mp4",
  },
  {
    id: "the-avengers",
    name: "The Avengers",
    type: "film",
    saga: "Infinity",
    phase: 1,
    universe: "Earth-616",
    recommendedOrder: 6,
    posterSrc: "/posters/avengers.jpg",
    trailerMutedPreviewSrc: "/trailers/avengers-preview.mp4",
  },
  {
    id: "loki-s1",
    name: "Loki: Season 1",
    type: "show",
    saga: "Multiverse",
    phase: 4,
    universe: "Earth-616",
    recommendedOrder: 30,
    posterSrc: "/posters/loki-s1.jpg",
  },
];