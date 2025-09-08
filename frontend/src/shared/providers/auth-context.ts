import { createStrictContext } from "../lib/react/createStrictContext";

export const [AuthContext, useAuth] = createStrictContext<{
  isAuthenticated: boolean;
}>();
