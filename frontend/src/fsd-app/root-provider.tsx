"use client";

import { LoaderContextProvider } from "@/shared/lib/loader";
import { bootstrap } from "./bootstrap/bootstrap";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { useUser } from "@/entities/user-session";
import { AuthListener } from "./auth-listener";

if (typeof window !== "undefined") {
  bootstrap();
}

export function RootProvider({ children }: { children: React.ReactNode }) {
  const [user] = useUser();

  return (
    <LoaderContextProvider>
      <AuthProvider isAuthenticated={Boolean(user)}>
        <AuthListener>{children}</AuthListener>
      </AuthProvider>
    </LoaderContextProvider>
  );
}
