import Image from "next/image";
import { cn } from "@/lib/utils";

export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full", className)}>
      <Image
        src="/chat-avatar/light.png"
        alt="AI-стилист"
        fill
        className="block object-cover dark:hidden"
      />
      <Image
        src="/chat-avatar/dark.png"
        alt="AI-стилист"
        fill
        className="hidden object-cover dark:block"
      />
    </div>
  );
}
