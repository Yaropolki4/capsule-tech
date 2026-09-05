import { RegisterForm } from "@/features/register";
import { AuthScreen } from "@/shared/ui/auth-screen";

const REGISTER_DECORATIONS = [
  {
    label: "сумка",
    className: "top-[24%] right-[6%] h-[228px] w-[176px]",
    animation: "float-b" as const,
    image: "/login-page/5.webp",
  },
  {
    label: "жакет",
    className: "bottom-[11%] left-[7%] h-[198px] w-[158px]",
    animation: "float-a" as const,
    image: "/login-page/4.webp",
  },
];

export default function RegisterPage() {
  return (
    <AuthScreen decorations={REGISTER_DECORATIONS} gradient="right">
      <RegisterForm />
    </AuthScreen>
  );
}
