
export type SagaSlug = "infinity" | "multiverse" | "legacy";

export function sagaToSlug(saga: "Infinity" | "Multiverse" | "Legacy"): SagaSlug {
    return saga.toLowerCase() as SagaSlug;
}

export function slugToSaga(slug: string): "Infinity" | "Multiverse" | "Legacy" | null {
  if (!slug) return null;

  switch (slug.toLowerCase()) {
    case "infinity":
      return "Infinity";
    case "multiverse":
      return "Multiverse";
    case "legacy":
      return "Legacy";
    default:
      return null;
  }
}

export function universeToSlug(universe: string): string {
    return encodeURIComponent(universe.replaceAll("/", "~"));
}

export function slugToUniverse(slug: string): string {
    return decodeURIComponent(slug.replaceAll("~", "/"));
}