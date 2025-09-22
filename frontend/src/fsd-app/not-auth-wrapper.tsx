import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/providers/auth-context";
import Image from "next/image";
import { LoginForm } from "@/features/auth";
import { usePathname } from "next/navigation";
import { publicRoutes } from "@/shared/constants/routes";

export function NotAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (
    !isAuthenticated &&
    !publicRoutes.includes(pathname as (typeof publicRoutes)[number])
  ) {
    return (
      <main className="flex w-full h-full">
        <section
          className={cn(
            "bg-secondary flex-1",
            "border-r-2 border-border",
            "md:flex max-md:hidden justify-center items-center flex-col"
          )}
        >
          <p className="text-center text-4xl font-semibold mb-1">
            Создавай. Комбинируй. Делись.
          </p>
          <p className="text-center text-4xl font-semibold mb-6">
            Твой AI-стилист всегда рядом.
          </p>
          <Image
            src="/images/auth-bg.png"
            alt="Login Background"
            width={300}
            height={300}
            priority
          />
        </section>
        <section className="bg-background md:basis-[676px] max-md:flex-1 flex items-center justify-center">
          <div className="px-12 w-full">
            <LoginForm />
          </div>
        </section>
      </main>
    );
  }

  return children;
}
