import Link from "next/link";
import { frontendUrl } from "@/lib/urls";

export function SiteHeader() {
  return (
    <div className="flex items-center justify-between gap-6 flex-wrap px-6 sm:px-10 py-5">
      <Link
        href="/"
        className="font-heading text-lg font-bold uppercase tracking-[0.01em]"
      >
        <span className="text-brand-accent-text">C</span>apsule AI
      </Link>
      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <Link href="/#capsules" className="hover:text-foreground transition-colors">
          Капсулы
        </Link>
        <Link href="/#features" className="hover:text-foreground transition-colors">
          Возможности
        </Link>
        <Link href="/#support" className="hover:text-foreground transition-colors">
          О проекте
        </Link>
        <a href={frontendUrl()} className="text-foreground font-semibold">
          Войти
        </a>
      </nav>
    </div>
  );
}
