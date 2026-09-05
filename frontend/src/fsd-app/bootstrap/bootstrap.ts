import { bootstrapUser } from "@/entities/user-session";

export function bootstrap() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }

  bootstrapUser();
}
