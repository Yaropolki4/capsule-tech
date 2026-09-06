"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step =
  | "user-typing"
  | "user-sent"
  | "thinking"
  | "building"
  | "proposal"
  | "pressing"
  | "loading"
  | "result"
  | "resetting";

const STEP_ORDER: { key: Step; duration: number }[] = [
  { key: "user-typing", duration: 700 },
  { key: "user-sent", duration: 550 },
  { key: "thinking", duration: 550 },
  { key: "building", duration: 1500 },
  { key: "proposal", duration: 3400 },
  { key: "pressing", duration: 350 },
  { key: "loading", duration: 1000 },
  { key: "result", duration: 3200 },
  { key: "resetting", duration: 400 },
];

const STEP_INDEX = Object.fromEntries(
  STEP_ORDER.map((step, index) => [step.key, index])
) as Record<Step, number>;

const USER_PROMPT = "Создай уютный вечерний образ";

const CAPSULE_ITEMS = [
  { name: "Джемпер женский 100% шерсть мериноса", price: 4735, image: "/demo/item-1.webp" },
  { name: "MAISON DAVID", price: 6012, image: "/demo/item-2.webp" },
  { name: "Ремень замшевый для джинс", price: 720, image: "/demo/item-3.webp" },
  { name: "Dino Ricci Select", price: 2731, image: "/demo/item-4.webp" },
];

function StylistAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 rounded-full overflow-hidden", className)}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ai-logo.png" alt="" className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-primary animate-thinking-dot"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Думаю над ответом...</span>
    </div>
  );
}

function ToolActivity({ done }: { done: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {done ? (
        <Check className="size-3.5 text-brand-accent-text" />
      ) : (
        <Loader2 className="size-3.5 animate-spin" />
      )}
      {done ? "Капсула готова" : "Собираю капсулу..."}
    </div>
  );
}

export function ChatDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEP_ORDER[stepIndex].key;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStepIndex((index) => (index + 1) % STEP_ORDER.length);
    }, STEP_ORDER[stepIndex].duration);

    return () => clearTimeout(timeout);
  }, [stepIndex]);

  const at = (key: Step) => STEP_INDEX[step] >= STEP_INDEX[key];
  const showUser = at("user-sent");
  const showAssistant = at("thinking");
  const isThinking = step === "thinking";
  const isBuilding = step === "building";
  const showProposalBody = at("proposal");
  const isPressing = step === "pressing";
  const isLoading = step === "loading";
  const showResultModal = at("result");
  const isFadingOut = step === "resetting";

  return (
    <div
      className={cn(
        "relative min-w-0 h-[675px] flex flex-col gap-3.5 p-4 sm:p-5 rounded-[26px]",
        "bg-[rgba(23,20,26,.75)] backdrop-blur-xl border border-white/10",
        "shadow-[0_40px_90px_-40px_rgba(0,0,0,.9)]"
      )}
    >
      <div className="shrink-0 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[#6E6674]">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        чат со стилистом
      </div>

      <div
        aria-hidden
        className="pointer-events-none select-none flex-1 min-h-0 overflow-hidden flex flex-col justify-end"
      >
        <div
          className={cn(
            "flex flex-col gap-3 transition-opacity duration-300",
            isFadingOut ? "opacity-0" : "opacity-100"
          )}
        >
          {showUser && (
            <div className="flex justify-end animate-rise-in">
              <div className="max-w-[82%] px-4 py-3 rounded-[16px_4px_16px_16px] bg-primary text-primary-foreground text-[15px] leading-snug">
                {USER_PROMPT}
              </div>
            </div>
          )}

          {showAssistant && (
            <div className="flex items-start gap-2.5 animate-rise-in">
              <StylistAvatar className="size-8 mt-0.5" />
              <div className="min-w-0 flex-1 flex flex-col gap-3 px-4 py-3 rounded-[4px_16px_16px_16px] bg-[#241F29] text-[15px] leading-snug">
                {isThinking && <ThinkingIndicator />}

                {(isBuilding || showProposalBody) && (
                  <ToolActivity done={showProposalBody} />
                )}

                {showProposalBody && (
                  <>
                    <p className="text-foreground/90">
                      Собрала капсулу «Уютный тёплый вечер» с мягким силуэтом и
                      глубокими природными оттенками. Все вещи — товары с
                      Wildberries.
                    </p>

                    <div className="flex flex-col gap-2">
                      {CAPSULE_ITEMS.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 rounded-[14px] bg-background/60 border border-white/[0.07] p-2.5"
                        >
                          <div className="relative size-12 rounded-[10px] overflow-hidden shrink-0 bg-[#1c191f]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt=""
                              className="absolute inset-0 size-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.price.toLocaleString("ru-RU")} ₽
                            </p>
                          </div>
                        </div>
                      ))}

                      <div
                        className={cn(
                          "self-start mt-1 rounded-[14px] bg-primary text-primary-foreground",
                          "text-xs font-semibold px-4 py-2.5",
                          isPressing && "animate-press"
                        )}
                      >
                        Собрать капсулу
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2.5 px-2 py-2 pl-4 rounded-full bg-[#0F0D11] border border-white/10 text-[#6E6674] text-[14.5px]">
        <span className="flex-1 truncate">Покажи вариант с юбкой…</span>
        <span className="flex items-center justify-center size-9 rounded-full bg-primary shrink-0">
          <ArrowUp className="size-4 text-primary-foreground" />
        </span>
      </div>

      {(isLoading || showResultModal) && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center p-6 rounded-[26px]",
            "bg-black/55 backdrop-blur-sm transition-opacity duration-300",
            isFadingOut ? "opacity-0" : "opacity-100"
          )}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-7 animate-spin text-brand-accent-text" />
              <span className="text-sm text-muted-foreground">
                Собираем капсулу...
              </span>
            </div>
          ) : (
            <div className="w-full max-w-[340px] flex flex-col gap-4 p-5 rounded-[22px] bg-card border border-white/10 shadow-2xl animate-rise-in">
              <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo/capsule-result.webp"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <p className="text-base text-center leading-snug text-foreground/90">
                Готово! Капсула «Уютный тёплый вечер» сохранена в твою ленту.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
