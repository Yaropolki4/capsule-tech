import { useAuth } from "@/shared/providers/auth-context";
import { useEffect, useRef } from "react";
import { useLoaderContext } from "@/shared/lib/loader";

export function AuthListener({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const loader = useLoaderContext();
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      if (isFirstRender.current) {
        loader.setIsLoading(false);
        isFirstRender.current = false;
      }
    }, 50);
  }, [isAuthenticated, loader]);

  return children;
}
