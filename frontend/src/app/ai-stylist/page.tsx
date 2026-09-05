"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChatThread, listChatThreads } from "@/entities/chat";
import { routes } from "@/shared/constants/routes";
import { Loader } from "@/shared/ui/ui/loader";

export default function AiStylistPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function resolveThread() {
      const { items } = await listChatThreads();
      const targetId = items[0]?.id ?? (await createChatThread()).id;

      if (!cancelled) {
        router.replace(routes.getAiStylistThread(targetId));
      }
    }

    void resolveThread();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="bg-background w-full h-full flex items-center justify-center">
      <Loader size="l" />
    </div>
  );
}
