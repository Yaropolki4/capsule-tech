"use client";

import { createStrictContext } from "../react/createStrictContext";

type LoaderContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const [LoaderContext, useLoaderContext] =
  createStrictContext<LoaderContextType>();

export { LoaderContext, useLoaderContext };
