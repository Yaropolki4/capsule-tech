import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";

export function ResponsiveButton({
  onClick,
  text,
  icon,
  variant,
  className,
  active,
}: {
  onClick: () => void;
  text: string;
  icon: React.ReactNode;
  variant: React.ComponentProps<typeof Button>["variant"];
  className?: string;
  active?: boolean;
}) {
  return (
    <>
      <Button
        fullWidth
        onClick={onClick}
        variant={variant}
        size="m"
        className={cn(
          "max-lg:hidden text-sm max-md:text-xs gap-4 uppercase tracking-[0.1em] font-semibold",
          active && "bg-brand-accent-soft text-foreground",
          className
        )}
      >
        {icon}
        {text}
        {active && <span className="size-1.5 rounded-full bg-primary ml-auto" />}
      </Button>
      <Button
        onClick={onClick}
        variant={variant}
        size="iconBig"
        className={cn(
          "lg:hidden max-md:text-base relative",
          active && "bg-brand-accent-soft text-foreground",
          className
        )}
      >
        {icon}
        {active && (
          <span className="absolute bottom-1.5 size-1.5 rounded-full bg-primary" />
        )}
      </Button>
    </>
  );
}
