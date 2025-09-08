import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface SessionStore {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
  expireAt: number;
  resetAccessToken: () => void;
}

export const sessionStore = create<SessionStore>()(
  persist(
    immer((set) => ({
      accessToken: "",
      expireAt: 0,
      setAccessToken: (accessToken: string) =>
        set((prev) => {
          prev.accessToken = accessToken;
          prev.expireAt = Date.now() + 1000 * 60 * 60 * 24;
        }),
      resetAccessToken: () =>
        set((prev) => {
          prev.accessToken = "";
          prev.expireAt = 0;
        }),
    })),
    {
      name: "session",
    }
  )
);

export function useAccessToken() {
  return [sessionStore().accessToken, sessionStore().setAccessToken] as const;
}

export function getAccessToken() {
  return sessionStore.getState().accessToken;
}

export function isAccessTokenExpired() {
  return sessionStore.getState().expireAt < Date.now();
}

export function resetAccessToken() {
  sessionStore.getState().resetAccessToken();
}
