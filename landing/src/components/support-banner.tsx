export function SupportBanner() {
  return (
    <div
      id="support"
      className="flex items-center gap-4 sm:gap-5 flex-wrap p-[10px] rounded-[20px] bg-[rgba(15,13,17,.94)] backdrop-blur-md border border-white/[0.09] shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)]"
    >
      <div className="shrink-0 flex items-center gap-3">
        <div className="flex items-center justify-center px-2.5 py-1.5 rounded-[10px] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fasie-logo.svg"
            alt="Фонд содействия инновациям"
            className="block w-16 sm:w-20 h-auto"
          />
        </div>
        <div className="flex items-center justify-center px-2.5 py-1.5 rounded-[10px] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/platform-logo.svg"
            alt="Платформа университетского технологического предпринимательства"
            className="block w-16 sm:w-20 h-auto"
          />
        </div>
      </div>
      <p className="flex-1 min-w-[200px] text-[11px] sm:text-xs leading-relaxed text-muted-foreground text-pretty">
        Проект создан при поддержке Федерального государственного бюджетного
        учреждения «Фонд содействия развитию малых форм предприятий в
        научно-технической сфере» в рамках программы «Студенческий стартап»
        федерального проекта «Платформа университетского технологического
        предпринимательства»
      </p>
    </div>
  );
}
