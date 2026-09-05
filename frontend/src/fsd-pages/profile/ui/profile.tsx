"use client";

import { useUser } from "@/entities/user-session";
import { ProfileInfo } from "@/features/profile-info";
import { ItemsList } from "@/widgets/items-list";
import { Scroller } from "@/shared/ui/ui/scroller";
import { useRef } from "react";
import { PageUserProvider } from "@/shared/providers/page-user/page-user-provider";
import { ManageSubscriptionButton } from "@/features/manage-subscription";
import {
  FollowingsListModal,
  FollowersListModal,
} from "@/features/subscribers-list";
import { useModal } from "@/shared/lib/modal/use-modal";
import { ServerError } from "@/shared/ui/ui/server-error";
import { ProfileNotFound } from "./profile-not-found";

export function Profile({ pageUserName }: { pageUserName: string }) {
  const { data, error, isLoading } = useUser(pageUserName);

  const user = data?.data;
  const parsedError = data?.error;
  const parentRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModal();

  if (parsedError?.cause === "server" || error) {
    return <ServerError />;
  }

  if (parsedError?.cause === "not_found" || (!user && !isLoading)) {
    return <ProfileNotFound name={pageUserName} />;
  }

  if (!user) {
    return <ServerError />;
  }

  return (
    <PageUserProvider pageUser={pageUserName}>
      <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
        <Scroller ref={parentRef}>
          <div className="flex flex-col items-center mb-20 max-md:mb-5">
            <ProfileInfo
              pageUser={user}
              isLoading={isLoading}
              manageSubscriptionButton={
                <ManageSubscriptionButton user={user} />
              }
              onSubscribersCountClick={() => {
                openModal({
                  Component: FollowersListModal,
                  props: {
                    userId: user.id,
                    renderActions: (follower, onClick) => (
                      <ManageSubscriptionButton
                        user={follower}
                        onClick={onClick}
                      />
                    ),
                  },
                });
              }}
              onFollowingsCountClick={() => {
                openModal({
                  Component: FollowingsListModal,
                  props: {
                    userId: user.id,
                    renderActions: (following, onClick) => (
                      <ManageSubscriptionButton
                        user={following}
                        onClick={onClick}
                      />
                    ),
                  },
                });
              }}
            />
          </div>
          <ItemsList parentRef={parentRef} />
        </Scroller>
      </div>
    </PageUserProvider>
  );
}
