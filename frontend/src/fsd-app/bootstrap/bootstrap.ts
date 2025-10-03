import { bootstrapUser } from "@/entities/user-session";

export function bootstrap() {
  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  bootstrapUser();
}
