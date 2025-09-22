"use client";

import { useUser } from "@/entities/user-session";
import { ProfileInfo } from "@/features/profile-info";
import { ItemsList } from "@/widgets/items-list";
import { Scroller } from "@/shared/ui/ui/scroller";
import { useRef } from "react";

export function Profile({ pageUserName }: { pageUserName: string }) {
  const { data, error, isLoading } = useUser(pageUserName);

  const user = data?.data;
  const parsedError = data?.error;
  const parentRef = useRef<HTMLDivElement>(null);

  if (user === null || error) {
    return <div>Unknown Error</div>;
  }

  if (parsedError?.cause === "server") {
    return <div>Unknown Error</div>;
  }

  if (parsedError?.cause === "not_found" || (!user && !isLoading)) {
    return <div>User not found</div>;
  }

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
      <Scroller ref={parentRef}>
        <div className="flex flex-col items-center mb-20 max-md:mb-5">
          <ProfileInfo
            pageUser={user}
            isLoading={isLoading}
            pageUserName={pageUserName}
          />
        </div>
        <ItemsList parentRef={parentRef} />
      </Scroller>
    </div>
  );
}
