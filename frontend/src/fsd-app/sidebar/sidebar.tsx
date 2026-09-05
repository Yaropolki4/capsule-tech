"use client";
import { logout, useCurrentUser } from "@/entities/user-session";
import { cn } from "@/lib/utils";
import { Camera, CircleUser, House, LogOut, Shapes, Shirt, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ResponsiveButton } from "./responsive-button";
import { QuotaCard } from "./quota-card";
import { ProfileFooter } from "./profile-footer";
import { routes } from "@/shared/constants/routes";

function Logo() {
  return (
    <div className="flex items-center px-4 max-md:hidden">
      <span className="font-heading text-lg font-bold uppercase max-lg:hidden">
        <span className="text-primary">C</span>apsule AI
      </span>
      <span className="font-heading text-lg font-bold lg:hidden">
        <span className="text-primary">C</span>
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "px-2 pt-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground",
        "max-lg:hidden max-md:hidden"
      )}
    >
      {children}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser] = useCurrentUser();

  const profileRoute = currentUser ? routes.getProfile(currentUser.name) : null;

  return (
    <>
      <div
        className={cn(
          "bg-background border-border",
          "max-w-64 min-w-64 h-full border-r-2",
          "max-lg:max-w-16 max-lg:min-w-16 max-md:max-w-full max-md:min-w-full",
          "max-md:w-full max-md:h-20 max-md:border-t-2",
          "flex flex-col gap-4 max-md:flex-row",
          "px-2 py-4 max-md:justify-center max-md:gap-8 max-md:items-center"
        )}
      >
        <Logo />

        <ResponsiveButton
          onClick={() => router.push(routes.home)}
          text="Стена"
          icon={<House size={24} className="size-6" />}
          variant="ghost"
          active={pathname === routes.home}
          className="justify-start max-lg:justify-center"
        />
        <ResponsiveButton
          onClick={() => router.push(routes.aiStylist)}
          text="AI-стилист"
          icon={<Sparkles size={24} className="size-6" />}
          variant="ghost"
          active={pathname === routes.aiStylist}
          className="justify-start max-lg:justify-center"
        />

        <SectionLabel>Мой гардероб</SectionLabel>

        <ResponsiveButton
          onClick={() => router.push(routes.wardrobe)}
          text="Гардероб"
          icon={<Shirt size={24} className="size-6" />}
          variant="ghost"
          active={pathname === routes.wardrobe}
          className="justify-start max-lg:justify-center"
        />
        <ResponsiveButton
          onClick={() => router.push(routes.newCapsule)}
          text="Капсулы"
          icon={<Shapes size={24} className="size-6" />}
          variant="ghost"
          active={pathname.startsWith("/capsules")}
          className="justify-start max-lg:justify-center"
        />
        <ResponsiveButton
          onClick={() => router.push(routes.fittingRoom)}
          text="Примерки"
          icon={<Camera size={24} className="size-6" />}
          variant="ghost"
          active={pathname === routes.fittingRoom}
          className="justify-start max-lg:justify-center"
        />

        <ResponsiveButton
          onClick={() => currentUser && router.push(routes.getProfile(currentUser.name))}
          text="Профиль"
          icon={<CircleUser size={24} className="size-6" />}
          variant="ghost"
          active={Boolean(profileRoute) && pathname === profileRoute}
          className="justify-start max-lg:justify-center md:hidden"
        />
        <ResponsiveButton
          onClick={() => logout()}
          text="Выйти"
          icon={<LogOut size={24} className="size-6" />}
          variant="ghost"
          className="justify-start max-lg:justify-center max-md:mt-0 md:hidden"
        />

        <div className="mt-auto max-md:hidden flex flex-col gap-4">
          <QuotaCard />
          <ProfileFooter />
        </div>
      </div>
    </>
  );
}
