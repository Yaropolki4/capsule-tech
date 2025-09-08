import { create } from "zustand";
import type { User } from "./types";

export interface UserStore {
  user: Maybe<User>;
  setUser: (user: User) => void;
}

export const userStore = create<UserStore>()((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));

export function useUser() {
  return [
    userStore((state) => state.user),
    userStore((state) => state.setUser),
  ] as const;
}
