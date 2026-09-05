"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterFormLayout } from "../ui/register-form-layout";
import { GenderToggle } from "../ui/gender-toggle";
import { PasswordStrengthMeter } from "../ui/password-strength-meter";
import { Input } from "@/shared/ui/ui/input";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { YandexIdButton } from "@/shared/ui/yandex-id-button";
import {
  useAccessToken,
  useCurrentUser,
  register as registerUser,
  REGISTER_ERROR_CAUSES,
} from "@/entities/user-session";

const SERVER_ERROR_TIMEOUT = 3000;

const authSchema = z.object({
  gender: z.enum(["MALE", "FEMALE"], { message: "Выберите пол" }),
  name: z.string().min(1, "Введите никнейм"),
  email: z.email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  agree: z
    .boolean()
    .refine((value) => value, { message: "Нужно согласие с условиями" }),
});

type RegisterFormData = z.infer<typeof authSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const [_, setAccessToken] = useAccessToken();
  const [__, setUser] = useCurrentUser();
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { agree: false },
  });

  const password = watch("password") ?? "";

  const onSubmit = async (data: RegisterFormData) => {
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
    errors.name?.message ??
    errors.email?.message ??
    errors.gender?.message ??
    errors.password?.message ??
    errors.agree?.message ??
    serverError;

  return (
    <RegisterFormLayout
      errorMessage={viewErrors}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }}
      yandexButton={
        <YandexIdButton>Зарегистрироваться через Yandex ID</YandexIdButton>
      }
      nicknameInput={
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
            Никнейм
          </span>
          <Input
            {...register("name")}
            aria-label="Никнейм"
            autoComplete="username"
            size="l"
            type="text"
            variant={errors?.name ? "destructive" : "default"}
            placeholder="nika"
          />
        </div>
      }
      emailInput={
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
            Email
          </span>
          <Input
            {...register("email")}
            aria-label="Email"
            autoComplete="email"
            size="l"
            type="email"
            variant={errors?.email ? "destructive" : "default"}
            placeholder="you@mail.com"
          />
        </div>
      }
      genderToggle={
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <GenderToggle
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors?.gender)}
            />
          )}
        />
      }
      passwordInput={
        <Input
          {...register("password")}
          id="password"
          type="password"
          aria-label="Пароль"
          autoComplete="new-password"
          size="l"
          variant={errors?.password ? "destructive" : "default"}
          placeholder="от 8 символов"
        />
      }
      passwordStrength={<PasswordStrengthMeter password={password} />}
      agreementCheckbox={
        <label className="text-muted-foreground flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed">
          <input
            {...register("agree")}
            type="checkbox"
            className={cn(
              "accent-primary mt-0.5 size-[18px] flex-none",
              errors.agree && "outline-destructive outline-1"
            )}
          />
          <span>
            Соглашаюсь с условиями и политикой конфиденциальности
          </span>
        </label>
      }
      submitButton={
        <Button
          type="submit"
          disabled={isSubmitting}
          fullWidth
          size="l"
        >
          Создать аккаунт
        </Button>
      }
      loginLink={
        <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
          <span>Уже есть аккаунт?</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-semibold"
            onClick={() => router.push(routes.home)}
          >
            Войти
          </Button>
        </div>
      }
    />
  );
}
