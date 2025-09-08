import { createStore } from "zustand";

type LoaderStore = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const loaderStore = createStore<LoaderStore>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const isLoading = () => {
  return loaderStore.getState().isLoading;
};

export const setIsLoading = (isLoading: boolean) => {
  loaderStore.getState().setIsLoading(isLoading);
};
