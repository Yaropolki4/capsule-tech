import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between gap-7 flex-wrap px-6 sm:px-10 py-8 pb-10 border-t border-border">
      <Link
        href="/"
        className="font-heading text-[15px] font-bold uppercase tracking-[0.01em]"
      >
        <span className="text-brand-accent-text">C</span>apsule AI
      </Link>
      <div className="flex items-center gap-5 flex-wrap text-[12.5px] text-[#7E7686]">
        <Link href="/#features" className="hover:text-foreground transition-colors">
          Возможности
        </Link>
        <Link href="/#support" className="hover:text-foreground transition-colors">
          О проекте
        </Link>
        <Link href="/privacy" className="hover:text-foreground transition-colors">
          Политика обработки персональных данных
        </Link>
        <span>© 2026 Capsule AI</span>
      </div>
    </footer>
  );
}
