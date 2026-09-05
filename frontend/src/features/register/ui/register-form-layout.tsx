import { cn } from "@/lib/utils";
import { TextCell } from "@/shared/ui/ui/text-cell";

const DIVIDER_CLASS =
  "text-muted-foreground flex items-center gap-3 font-mono text-[10px] " +
  "tracking-[0.18em] uppercase";

type RegisterFormLayoutProps = {
  errorMessage: Maybe<string>;
  yandexButton: React.ReactNode;
  nicknameInput: React.ReactNode;
  emailInput: React.ReactNode;
  genderToggle: React.ReactNode;
  passwordInput: React.ReactNode;
  passwordStrength: React.ReactNode;
  agreementCheckbox: React.ReactNode;
  submitButton: React.ReactNode;
  loginLink: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
};

export function RegisterFormLayout({
  errorMessage,
  yandexButton,
  nicknameInput,
  emailInput,
  genderToggle,
  passwordInput,
  passwordStrength,
  agreementCheckbox,
  submitButton,
  loginLink,
  onSubmit,
}: RegisterFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-6">
      <div
        className={cn(
          "absolute -top-14 w-full opacity-100 transition-opacity duration-500",
          !errorMessage && "invisible opacity-0"
        )}
      >
        <TextCell message={errorMessage ?? "invisible"} />
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-heading text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-[44px]">
          Давай <span className="text-brand-accent-text">знакомиться</span>.
        </p>
        <p className="text-muted-foreground max-w-[400px] text-base text-balance">
          Минута на аккаунт — и можно загружать вещи.
        </p>
      </div>

      <div className="bg-card border-border shadow-elevated flex flex-col gap-4 rounded-[26px] border p-5">
        {yandexButton}

        <div className={DIVIDER_CLASS}>
          <span className="bg-border h-px flex-1" />
          нет Yandex ID
          <span className="bg-border h-px flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {nicknameInput}
          {emailInput}
          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
              Пол
            </span>
            {genderToggle}
            <span className="text-muted-foreground text-xs">
              Нужен, чтобы AI подбирал подходящие капсулы
            </span>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
              Пароль
            </span>
            {passwordInput}
          </div>
        </div>

        {passwordStrength}

        {agreementCheckbox}

        {submitButton}
      </div>

      {loginLink}
    </form>
  );
}
