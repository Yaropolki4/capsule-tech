"use client";

import { Button } from "@/shared/ui/ui/button";
import { Input } from "@/shared/ui/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginFormLayout } from "../ui/login-form-layout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/shared/constants/routes";
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

export function LoginForm() {
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const router = useRouter();
  const [_, setAccessToken] = useAccessToken();
  const [__, setUser] = useCurrentUser();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(authSchema),
  });

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
      authTitle="Авторизация"
      errorMessage={viewErrors?.message ?? serverError}
      emailInput={
        <Input
          {...register("email")}
          autoComplete="email"
          aria-label="Email"
          size="l"
          type="email"
          variant={errors?.email ? "destructive" : "default"}
          placeholder="Введите email"
        />
      }
      passwordInput={
        <Input
          {...register("password")}
          id="password"
          type="password"
          aria-label="Пароль"
          autoComplete="current-password"
          size="l"
          variant={errors?.password ? "destructive" : "default"}
          placeholder="Введите пароль"
        />
      }
      submitButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
          disabled={Boolean(isSubmitting || errors.email || errors.password)}
          type="submit"
          fullWidth
          size="m"
        >
          Войти
        </Button>
      }
      forgotPasswordButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
          }}
          disabled={isSubmitting}
          fullWidth
          size="m"
          variant="ghost"
        >
          Забыли пароль?
        </Button>
      }
      registerButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
            router.push(routes.register);
          }}
          variant="outline"
          size="m"
          fullWidth
        >
          Зарегистрироваться
        </Button>
      }
      googleButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
          }}
          variant="outline"
          size="m"
          fullWidth
        >
          <div className="flex items-center justify-center gap-2">
            <p>Войти через Google</p>
          </div>
        </Button>
      }
    />
  );
}
