"use client";

import { createContext, useContext } from "react";

export function createStrictContext<T>() {
  const context = createContext<T | null>(null);

  return [
    context,
    () => {
      const value = useContext(context);

      if (!value) {
        throw new Error(
          `use${context.displayName} must be used within a ${context.displayName}Provider`
        );
      }

      return value;
    },
  ] as const;
}
