"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginFormLayout } from "../ui/login-form-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/constants/routes";
import { YandexIdButton } from "@/shared/ui/yandex-id-button";
import {
  useAccessToken,
  useCurrentUser,
  login,
  AUTH_ERROR_CAUSES,
} from "@/entities/user-session";

const SERVER_ERROR_TIMEOUT = 3000;

const authSchema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type LoginFormData = z.infer<typeof authSchema>;
type Step = "email" | "password";

const PILL_CLASS = cn(
  "border-input bg-background focus-within:border-ring",
  "flex items-center gap-2.5 rounded-full border py-1.5 pr-1.5 pl-4.5"
);
const PILL_INPUT_CLASS = cn(
  "placeholder:text-muted-foreground min-h-11 min-w-0 flex-1",
  "border-0 bg-transparent text-[15px] outline-none"
);

export function LoginForm() {
  const [step, setStep] = useState<Step>("email");
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const router = useRouter();
  const [_, setAccessToken] = useAccessToken();
  const [__, setUser] = useCurrentUser();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(authSchema),
  });

  const email = watch("email") ?? "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("yandexError")) {
      toast.error("Не удалось войти через Yandex ID");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const toPasswordStep = async () => {
    const isEmailValid = await trigger("email");

    if (isEmailValid) setStep("password");
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(undefined);
    const result = await login(data);

    if (result.data) {
      router.replace(routes.getProfile(result.data.user.name));

      setUser(result.data.user);

      setAccessToken(result.data.accessToken);

      return;
    }

    if (
      [...AUTH_ERROR_CAUSES].includes(
        result.error?.cause as (typeof AUTH_ERROR_CAUSES)[number]
      )
    ) {
      if (result.error?.cause === "email") setStep("email");

      setError(result.error?.cause as (typeof AUTH_ERROR_CAUSES)[number], {
        message: result.error?.message,
      });

      return;
    } else if (result.error?.cause === "server") {
      setServerError(result.error?.message);

      setTimeout(() => {
        setServerError(undefined);
      }, SERVER_ERROR_TIMEOUT);
    }
  };

  const viewErrors = errors.email ?? errors.password;

  return (
    <LoginFormLayout
      errorMessage={viewErrors?.message ?? serverError}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
      yandexButton={<YandexIdButton>Продолжить с Yandex ID</YandexIdButton>}
      stepContent={
        step === "email" ? (
          <div className={cn(PILL_CLASS, errors.email && "border-destructive")}>
            <input
              {...register("email")}
              autoFocus
              autoComplete="email"
              aria-label="Email"
              type="email"
              placeholder="you@mail.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  toPasswordStep();
                }
              }}
              className={PILL_INPUT_CLASS}
            />
            <Button
              type="button"
              size="icon"
              className="flex-none rounded-full"
              aria-label="Продолжить"
              onClick={toPasswordStep}
            >
              <ArrowRight className="size-4.5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div
              className={cn(
                "bg-secondary flex max-w-full items-center gap-2.5",
                "self-start rounded-full py-1.5 pr-2 pl-3.5"
              )}
            >
              <span className="min-w-0 truncate text-sm">{email}</span>
              <Button
                type="button"
                variant="ghost"
                size="s"
                className="text-brand-accent-text h-auto rounded-full px-2.5 py-1"
                onClick={() => setStep("email")}
              >
                изменить
              </Button>
            </div>
            <div className={cn(PILL_CLASS, errors.password && "border-destructive")}>
              <input
                {...register("password")}
                autoFocus
                id="password"
                type="password"
                aria-label="Пароль"
                autoComplete="current-password"
                placeholder="Пароль"
                className={PILL_INPUT_CLASS}
              />
              <Button
                type="submit"
                size="m"
                className="flex-none rounded-full"
                disabled={isSubmitting}
              >
                Войти
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto self-start p-0 pl-1 text-sm"
              onClick={(e) => e.preventDefault()}
            >
              Забыли пароль?
            </Button>
          </div>
        )
      }
      registerLink={
        <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
          <span>Нет аккаунта?</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-semibold"
            onClick={() => router.push(routes.register)}
          >
            Зарегистрироваться
          </Button>
        </div>
      }
    />
  );
}
