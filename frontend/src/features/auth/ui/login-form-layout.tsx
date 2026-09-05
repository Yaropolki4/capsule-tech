import { Fragment } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextCell } from "@/shared/ui/ui/text-cell";

const FOOTER_TAGS = ["примерка", "капсулы", "лента"];

const DIVIDER_CLASS =
  "text-muted-foreground flex items-center gap-3 font-mono text-[10px] " +
  "tracking-[0.18em] uppercase";
const FOOTER_CLASS =
  "text-muted-foreground flex items-center justify-center gap-5 font-mono " +
  "text-[10px] tracking-[0.16em] uppercase";

type LoginFormLayoutProps = {
  errorMessage: Maybe<string>;
  yandexButton: React.ReactNode;
  stepContent: React.ReactNode;
  registerLink: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
};

export function LoginFormLayout({
  errorMessage,
  yandexButton,
  stepContent,
  registerLink,
  onSubmit,
}: LoginFormLayoutProps) {
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
        <p className="font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-[46px]">
          Привет. Я твой
          <br />
          <span className="text-brand-accent-text">AI-стилист</span>.
        </p>
        <p className="text-muted-foreground max-w-[400px] text-base text-balance">
          Зайди — и соберём первую капсулу из твоих вещей за пару минут.
        </p>
      </div>

      <div className="bg-card border-border shadow-elevated flex flex-col gap-4 rounded-[26px] border p-5">
        <div className="flex items-start gap-2.5">
          <div className="bg-primary flex size-7.5 flex-none items-center justify-center rounded-[10px]">
            <Sparkles className="text-primary-foreground size-4" />
          </div>
          <div className="bg-secondary max-w-[80%] rounded-tl-sm rounded-[16px] px-3.5 py-3 text-sm leading-snug">
            Заходи в один тап — и начнём с твоих вещей.
          </div>
        </div>

        {yandexButton}

        <div className={DIVIDER_CLASS}>
          <span className="bg-border h-px flex-1" />
          или по email
          <span className="bg-border h-px flex-1" />
        </div>

        {stepContent}
      </div>

      {registerLink}

      <div className={FOOTER_CLASS}>
        {FOOTER_TAGS.map((tag, index) => (
          <Fragment key={tag}>
            {index > 0 && <span className="text-brand-accent-text">·</span>}
            <span>{tag}</span>
          </Fragment>
        ))}
      </div>
    </form>
  );
}
