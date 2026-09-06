export function SupportBanner() {
  return (
    <div
      id="support"
      className="flex items-center gap-5 flex-wrap px-5 py-4 mx-6 sm:mx-10 mb-6 rounded-[20px] bg-[rgba(20,18,22,.86)] backdrop-blur-md border border-white/[0.09] shadow-[0_30px_70px_-40px_rgba(0,0,0,.9)]"
    >
      <div className="shrink-0 flex items-center justify-center px-3 py-2 rounded-[10px] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fasie-logo.svg" alt="Фонд содействия инновациям" className="block w-32 h-auto" />
      </div>
      <p className="flex-1 min-w-[280px] text-xs leading-relaxed text-muted-foreground text-pretty">
        Проект создан при поддержке Федерального государственного бюджетного
        учреждения «Фонд содействия развитию малых форм предприятий в
        научно-технической сфере» в рамках программы «Студенческий стартап»
        федерального проекта «Платформа университетского технологического
        предпринимательства»
      </p>
    </div>
  );
}
