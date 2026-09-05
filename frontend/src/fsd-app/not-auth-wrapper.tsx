import { useAuth } from "@/shared/providers/auth-context";
import { LoginForm } from "@/features/auth";
import { usePathname } from "next/navigation";
import { publicRoutes } from "@/shared/constants/routes";
import { AuthScreen } from "@/shared/ui/auth-screen";

const LOGIN_DECORATIONS = [
  {
    label: "пальто",
    className: "top-[28%] left-[5%] h-[250px] w-[190px]",
    animation: "float-a" as const,
    image: "/login-page/1.webp",
  },
  {
    label: "платье",
    className: "top-[20%] right-[6%] h-[220px] w-[170px]",
    animation: "float-b" as const,
    image: "/login-page/2.webp",
  },
  {
    label: "кроссовки",
    className: "right-[12%] bottom-[10%] h-[190px] w-[150px]",
    animation: "float-a" as const,
    image: "/login-page/3.webp",
  },
];

export function NotAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (
    !isAuthenticated &&
    !publicRoutes.includes(pathname as (typeof publicRoutes)[number])
  ) {
    return (
      <AuthScreen decorations={LOGIN_DECORATIONS} gradient="left">
        <LoginForm />
      </AuthScreen>
    );
  }

  return children;
}
