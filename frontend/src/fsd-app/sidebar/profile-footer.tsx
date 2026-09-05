"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout, useCurrentUser } from "@/entities/user-session";
import { AvatarContainer } from "@/shared/ui/ui/avatar";
import { Button } from "@/shared/ui/ui/button";
import { ThemeToggle } from "@/shared/ui/ui/theme-toggle";
import { routes } from "@/shared/constants/routes";

export function ProfileFooter() {
  const router = useRouter();
  const [currentUser] = useCurrentUser();

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2 px-2">
      <button
        type="button"
        onClick={() => router.push(routes.getProfile(currentUser.name))}
        className="flex flex-1 items-center gap-2 min-w-0 text-left cursor-pointer"
      >
        <AvatarContainer url={currentUser.avatarUrl} className="size-9" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {currentUser.fullName}
          </div>
          <div className="text-xs text-muted-foreground">Профиль</div>
        </div>
      </button>
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => logout()}
        aria-label="Выйти"
      >
        <LogOut size={18} />
      </Button>
    </div>
  );
}
