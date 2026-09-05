"use client";

import { useEffect, useState } from "react";

const MEDIA_MD = "(min-width: 768px)";
const MEDIA_LG = "(min-width: 1024px)";

/** 2 lanes below `md`, 3 between `md`/`lg`, 4 at `lg`+. */
export function useResponsiveLanes(): number {
  const [lanes, setLanes] = useState(2);

  useEffect(() => {
    const mdQuery = window.matchMedia(MEDIA_MD);
    const lgQuery = window.matchMedia(MEDIA_LG);

    const update = () => {
      if (lgQuery.matches) {
        setLanes(4);
      } else if (mdQuery.matches) {
        setLanes(3);
      } else {
        setLanes(2);
      }
    };

    update();
    mdQuery.addEventListener("change", update);
    lgQuery.addEventListener("change", update);

    return () => {
      mdQuery.removeEventListener("change", update);
      lgQuery.removeEventListener("change", update);
    };
  }, []);

  return lanes;
}
