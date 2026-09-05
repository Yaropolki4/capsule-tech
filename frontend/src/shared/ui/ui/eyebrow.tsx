import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="eyebrow"
      className={cn(
        "font-mono uppercase tracking-widest text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
