import { ArrowRight, Shirt, Sparkles, LayoutGrid } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportBanner } from "@/components/support-banner";
import { ChatDemo } from "@/components/chat-demo";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Капсулы",
    text: "6–8 вещей, из которых получается неделя образов. ИИ учитывает погоду, повод и то, что уже висит в шкафу.",
  },
  {
    icon: Shirt,
    title: "Виртуальная примерка",
    text: "Смотри образ на себе до покупки и до утренней спешки: вещь надевается на твоё фото за пару секунд.",
  },
  {
    icon: LayoutGrid,
    title: "Лента",
    text: "Капсулы других пользователей, лайки и сохранения. Понравился образ — соберём похожий из своих вещей.",
  },
];

const CAPSULES = [
  {
    image: "/demo/capsule-evening.svg",
    tag: "вечер · 5 вещей · 3 образа",
    title: "Белый и серебро",
    text: "Платье цвета шампань, блеск в обуви и сумке.",
  },
  {
    image: "/demo/capsule-city.svg",
    tag: "город · 6 вещей · 5 образов",
    title: "Белое с одним акцентом",
    text: "Кружево и жакет — от работы до ужина, акцент один: красная сумка.",
  },
  {
    image: "/demo/capsule-casual.svg",
    tag: "каждый день · 4 вещи · 4 образа",
    title: "Серый монохром",
    text: "Один тон, один принт — утром ничего не нужно подбирать.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="relative overflow-hidden bg-[radial-gradient(110%_80%_at_78%_6%,#2A0A1D_0%,#0B0A0C_58%)]">
        <SiteHeader />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-[1320px] w-full mx-auto px-6 sm:px-10 pt-6 pb-14">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-accent-text">
              ai-стилист · капсульный гардероб
            </div>
            <h1 className="font-heading text-[38px] sm:text-[52px] lg:text-[60px] leading-[1] font-bold tracking-[-0.04em] text-balance">
              Капсула из своих вещей за{" "}
              <span className="text-brand-accent-text">две минуты</span>
            </h1>
            <p className="text-[17px] leading-relaxed text-muted-foreground max-w-[460px] text-pretty">
              Загрузи гардероб, напиши задачу словами — ИИ соберёт готовые
              образы и объяснит, почему они работают.
            </p>
            <div className="flex gap-3 flex-wrap pt-1">
              <a
                href="#signup"
                className="inline-flex items-center gap-2.5 h-14 px-7 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:brightness-110 transition-[filter]"
              >
                Создать аккаунт
                <ArrowRight className="size-[18px]" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center h-14 px-6 rounded-2xl border border-white/[0.16] text-base font-semibold hover:border-primary transition-colors"
              >
                Как это работает
              </a>
            </div>
            <div className="flex items-center gap-4 pt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-[#6E6674]">
              <span>примерка</span>
              <span className="text-primary">·</span>
              <span>капсула</span>
              <span className="text-primary">·</span>
              <span>лента</span>
            </div>
          </div>

          <ChatDemo />
        </div>

        <SupportBanner />
      </section>

      <section id="features" className="flex flex-col gap-9 max-w-[1320px] w-full mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <div className="flex flex-col gap-3 max-w-[620px]">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-accent-text">
            возможности
          </div>
          <h2 className="font-heading text-[30px] sm:text-[40px] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
            Три вещи, которые делает Capsule AI
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col gap-3.5 p-6 rounded-3xl bg-card border border-border hover:border-primary/45 transition-colors"
            >
              <div className="size-[42px] rounded-2xl bg-brand-accent-soft flex items-center justify-center">
                <Icon className="size-[21px] text-brand-accent-text" strokeWidth={1.9} />
              </div>
              <div className="font-heading text-xl font-semibold tracking-[-0.02em]">
                {title}
              </div>
              <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div id="capsules" className="flex flex-col gap-8 pt-8">
          <div className="flex flex-col gap-3 max-w-[640px]">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-accent-text">
              главная фича
            </div>
            <h2 className="font-heading text-[28px] sm:text-[36px] leading-[1.06] font-bold tracking-[-0.035em] text-balance">
              Капсула — 5–8 вещей, из которых собирается весь сезон
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-pretty">
              ИИ подбирает набор, где каждая вещь работает минимум в трёх
              образах.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-5 flex-wrap">
              <div className="font-heading text-[22px] font-semibold tracking-[-0.02em]">
                Уже собранные капсулы
              </div>
              <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#6E6674]">
                примеры из ленты
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAPSULES.map(({ image, tag, title, text }) => (
                <div
                  key={title}
                  className="flex flex-col overflow-hidden rounded-[22px] bg-card border border-border hover:border-primary/45 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={title}
                    className="block w-full aspect-[4/5] object-cover"
                  />
                  <div className="flex flex-col gap-2 p-[18px]">
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-brand-accent-text">
                      {tag}
                    </div>
                    <div className="font-heading text-[19px] font-semibold tracking-[-0.02em]">
                      {title}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          id="signup"
          className="flex items-center justify-between gap-7 flex-wrap p-8 mt-8 rounded-[26px] bg-[radial-gradient(120%_140%_at_100%_0%,#3A0C24_0%,#141216_60%)] border border-primary/[0.28]"
        >
          <div className="flex flex-col gap-2 min-w-[260px]">
            <div className="font-heading text-2xl sm:text-3xl leading-[1.1] font-bold tracking-[-0.03em] text-balance">
              Первая капсула — сегодня вечером
            </div>
            <p className="text-[15px] text-muted-foreground">
              Регистрация занимает минуту, гардероб можно загружать по одной
              вещи.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2.5 h-14 px-[30px] rounded-2xl bg-primary text-primary-foreground text-base font-semibold whitespace-nowrap hover:brightness-110 transition-[filter]"
          >
            Создать аккаунт
            <ArrowRight className="size-[18px]" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
