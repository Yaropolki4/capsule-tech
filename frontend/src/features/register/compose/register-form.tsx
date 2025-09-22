"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterFormLayout } from "../ui/register-form-layout";
import { Input } from "@/shared/ui/ui/input";
import { Button } from "@/shared/ui/ui/button";
import { routes } from "@/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useAccessToken,
  useCurrentUser,
  register as registerUser,
  REGISTER_ERROR_CAUSES,
} from "@/entities/user-session";

const SERVER_ERROR_TIMEOUT = 3000;

const authSchema = z
  .object({
    email: z.email("Некорректный email"),
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    confirmPassword: z
      .string()
      .min(6, "Пароль должен быть не менее 6 символов"),
    fullName: z.string().min(1, "Введите имя"),
    name: z.string().min(1, "Введите никнейм"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают",
  });

type LoginFormData = z.infer<typeof authSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const [_, setAccessToken] = useAccessToken();
  const [__, setUser] = useCurrentUser();
  const router = useRouter();
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
    const result = await registerUser(data);

    if (result.data) {
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      router.push(routes.home);

      return;
    }

    if (
      [...REGISTER_ERROR_CAUSES].includes(
        result.error?.cause as (typeof REGISTER_ERROR_CAUSES)[number]
      )
    ) {
      setError(result.error?.cause as (typeof REGISTER_ERROR_CAUSES)[number], {
        message: result.error?.message,
      });

      return;
    } else if (result.error?.cause === "server") {
      setServerError(result.error?.message);

      setTimeout(() => {
        setServerError(undefined);
      }, SERVER_ERROR_TIMEOUT);

      return;
    } else {
      throw new Error("Unknown cause error");
    }
  };

  const viewErrors =
    errors.email?.message ??
    errors.password?.message ??
    errors.confirmPassword?.message ??
    errors.fullName?.message ??
    errors.name?.message ??
    serverError;

  return (
    <RegisterFormLayout
      authTitle="Регистрация"
      authDescription="Создайте аккаунт, чтобы начать использовать ai стилиста"
      errorMessage={viewErrors}
      emailInput={
        <>
          <label className="text-sm font-medium mb-1 block" htmlFor="email">
            Email
          </label>
          <Input
            {...register("email")}
            autoComplete="email"
            aria-label="Email"
            size="l"
            type="email"
            variant={errors?.email ? "destructive" : "default"}
            placeholder="Введите email"
          />
        </>
      }
      passwordInput={
        <>
          <label className="text-sm font-medium mb-1 block" htmlFor="password">
            Пароль
          </label>
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
        </>
      }
      confirmPasswordInput={
        <>
          <label
            className="text-sm font-medium mb-1 block"
            htmlFor="confirmPassword"
          >
            Подтверждение пароля
          </label>
          <Input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            aria-label="Подтверждение пароля"
            autoComplete="confirm-password"
            size="l"
            variant={errors?.confirmPassword ? "destructive" : "default"}
            placeholder="Подтвердите пароль"
          />
        </>
      }
      fullNameInput={
        <>
          <label className="text-sm font-medium mb-1 block" htmlFor="fullName">
            Имя
          </label>
          <Input
            {...register("fullName")}
            id="fullName"
            type="text"
            aria-label="Имя"
            autoComplete="full-name"
            size="l"
            variant={errors?.fullName ? "destructive" : "default"}
            placeholder="Введите имя"
          />
        </>
      }
      nameInput={
        <>
          <label className="text-sm font-medium mb-1 block" htmlFor="name">
            Никнейм
          </label>
          <Input
            {...register("name")}
            id="name"
            type="text"
            aria-label="Никнейм"
            autoComplete="name"
            size="l"
            variant={errors?.name ? "destructive" : "default"}
            placeholder="Введите никнейм"
          />
        </>
      }
      submitButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }}
          disabled={Boolean(isSubmitting || viewErrors)}
          type="submit"
          fullWidth
          size="m"
        >
          Зарегистрироваться
        </Button>
      }
      alreadyHaveAccountButton={
        <Button
          onClick={(e) => {
            e.preventDefault();
            router.push(routes.home);
          }}
          variant="outline"
          size="m"
          fullWidth
        >
          Уже есть аккаунт? Войти
        </Button>
      }
    />
  );
}
