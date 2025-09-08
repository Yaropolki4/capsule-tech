"use client";

import { Loader } from "@/shared/ui/ui/loader";
import { LoaderContext } from "./loader-context";
import { useState } from "react";

export function LoaderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && (
        <div className="flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-10 bg-secondary">
          <Loader />
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  );
}
