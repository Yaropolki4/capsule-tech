"use client";

import { LoaderContextProvider } from "@/shared/lib/loader";
import { bootstrap } from "./bootstrap/bootstrap";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { useCurrentUser } from "@/entities/user-session";
import { AuthListener } from "./auth-listener";
import { NotAuthWrapper } from "./not-auth-wrapper";
import { Sidebar } from "./sidebar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/query-client";
import { ModalProvider } from "@/shared/lib/modal/modal-provider";

if (typeof window !== "undefined") {
  bootstrap();
}

export function RootProvider({ children }: { children: React.ReactNode }) {
  const [user] = useCurrentUser();

  return (
    <LoaderContextProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <AuthProvider isAuthenticated={Boolean(user)}>
            <AuthListener>
              <NotAuthWrapper>
                <Sidebar />
                {children}
              </NotAuthWrapper>
            </AuthListener>
          </AuthProvider>
        </ModalProvider>
      </QueryClientProvider>
    </LoaderContextProvider>
  );
}
