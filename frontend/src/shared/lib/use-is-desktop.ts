"use client";

import { useEffect, useState } from "react";

const MEDIA_LG = "(min-width: 1024px)";

/** Совпадает с брейкпоинтом `lg:` в Tailwind — см. use-responsive-lanes.ts. */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MEDIA_LG);
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
