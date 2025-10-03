"use client";

import { AvatarContainer } from "@/shared/ui/ui/avatar";
import { Button } from "@/shared/ui/ui/button";
import { ProfileNumberField } from "../ui/profile-number-field";
import { ProfileInfoLayout } from "../ui/profile-info-layout";
import { Skeleton } from "@/shared/ui/ui/skeleton";
import { useCurrentUser, type User } from "@/entities/user-session";
import { EditProfileMenu } from "../ui/edit-profile-menu";
import { useModal } from "@/shared/lib/modal/use-modal";
import { MobileProfileInfo } from "../ui/mobile-profile-info";
import { usePageUser } from "@/shared/providers/page-user/page-user-context";

export function ProfileInfo({
  pageUser,
  isLoading,
  manageSubscriptionButton,
  onSubscribersCountClick,
  onFollowingsCountClick,
}: {
  pageUser: Maybe<Omit<User, "email">>;
  isLoading: boolean;
  manageSubscriptionButton: React.ReactNode;
  onSubscribersCountClick: () => void;
  onFollowingsCountClick: () => void;
}) {
  const [currentUser] = useCurrentUser();
  const { openModal } = useModal();
  const pageUserName = usePageUser();

  if (isLoading) {
    return (
      <ProfileInfoLayout
        avatar={<Skeleton className="w-40 h-40 rounded-full bg-secondary" />}
        info={
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-7 bg-secondary" />
            <Skeleton className="w-20 h-7 bg-secondary" />
            <Skeleton className="w-20 h-7 bg-secondary" />
          </div>
        }
        controls={<Skeleton className="w-24 h-8 bg-secondary" />}
        userName={pageUserName}
        bio={<Skeleton className="w-40 h-6 bg-secondary" />}
        mobileInfo={
          <div className="max-md:block hidden w-full">
            <div className="flex items-center border-t border-border py-2 gap-2 mt-8">
              <Skeleton className="flex-1 h-16" />
              <Skeleton className="flex-1 h-16" />
              <Skeleton className="flex-1 h-16" />
            </div>
          </div>
        }
      />
    );
  }

  const ownProfile = currentUser?.name === pageUser?.name;

  if (!pageUser || !currentUser) {
    return null;
  }

  const renderControls = () => {
    if (ownProfile) {
      return (
        <Button
          onClick={() => {
            openModal({
              Component: EditProfileMenu,
              props: {
                name: pageUser.name,
                bio: pageUser.bio,
              },
            });
          }}
          variant="outline"
        >
          Редактировать профиль
        </Button>
      );
    }

    return manageSubscriptionButton;
  };

  return (
    <>
      <ProfileInfoLayout
        avatar={
          <AvatarContainer
            url={pageUser.avatarUrl}
            className="w-40 h-40 max-md:h-20 max-md:w-20"
          />
        }
        userName={pageUser.name}
        info={
          <>
            <div className="flex items-center gap-4 max-md:hidden">
              <ProfileNumberField
                onClick={onSubscribersCountClick}
                number={pageUser.followersCount}
                label="подписчиков"
              />
              <ProfileNumberField
                onClick={onFollowingsCountClick}
                number={pageUser.followingCount}
                label="подписок"
              />
              <ProfileNumberField
                number={pageUser.capsulesQuantity}
                label="капсул"
              />
            </div>
          </>
        }
        mobileInfo={
          <div className="max-md:block hidden w-full">
            <MobileProfileInfo />
          </div>
        }
        controls={renderControls()}
        bio={
          <div className="text-sm font-medium max-w-80 truncate">
            {pageUser.bio}
          </div>
        }
      />
    </>
  );
}
