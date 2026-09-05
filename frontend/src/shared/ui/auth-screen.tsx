import Image from "next/image";
import { cn } from "@/lib/utils";

type Decoration = {
  label: string;
  className: string;
  animation?: "float-a" | "float-b";
  image?: string;
};

function FloatingGarmentCard({ label, className, animation = "float-a", image }: Decoration) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden overflow-hidden rounded-[22px] border border-border",
        "items-end p-3.5 select-none lg:flex",
        image ? "opacity-90" : "bg-gradient-to-br from-secondary to-card opacity-70",
        animation === "float-a" ? "animate-float-a" : "animate-float-b",
        className
      )}
    >
      {image && (
        <>
          <Image src={image} alt="" fill sizes="200px" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </>
      )}
      <span
        className={cn(
          "relative font-mono text-[9px] tracking-[0.12em] uppercase",
          image ? "text-white/90" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function AuthScreen({
  children,
  decorations = [],
  gradient = "left",
}: {
  children: React.ReactNode;
  decorations?: Decoration[];
  gradient?: "left" | "right";
}) {
  return (
    <main
      className={cn(
        "bg-background relative flex min-h-full w-full items-center",
        "justify-center overflow-hidden px-6 py-16"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          gradient === "left"
            ? "bg-[radial-gradient(120%_90%_at_14%_0%,var(--brand-accent-soft)_0%,transparent_58%)]"
            : "bg-[radial-gradient(120%_90%_at_86%_0%,var(--brand-accent-soft)_0%,transparent_58%)]"
        )}
      />

      <div className="absolute top-7 left-6 z-10 md:top-9 md:left-10">
        <span className="font-heading text-lg font-bold tracking-tight uppercase">
          <span className="text-brand-accent-text">C</span>
          <span className="text-foreground">APSULE AI</span>
        </span>
      </div>

      {decorations.map((decoration) => (
        <FloatingGarmentCard key={decoration.label} {...decoration} />
      ))}

      <div className="relative z-10 w-full max-w-[540px]">{children}</div>
    </main>
  );
}
