import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { AlertCircle } from "lucide-react";

const textCellVariants = cva(
  "flex items-center justify-start rounded-lg gap-2 overflow-hidden",
  {
    variants: {
      size: {
        default: "p-3",
        s: "p-1",
      },
      variant: {
        destructive: "bg-destructive/5 border border-destructive/10",
      },
    },
    defaultVariants: {
      variant: "destructive",
    },
  }
);

const textVariants = cva("truncate", {
  variants: {
    variant: {
      destructive: "text-destructive font-medium",
    },
    size: {
      default: "",
      s: "text-sm",
    },
  },
});

export function TextCell({
  message,
  variant = "destructive",
  size = "default",
}: VariantProps<typeof textCellVariants> & {
  message: React.ReactNode;
}) {
  return (
    <>
      <div className={cn(textCellVariants({ variant, size }))}>
        {variant === "destructive" ? (
          <div>
            <AlertCircle color="var(--destructive)" className="size-4" />
          </div>
        ) : null}
        <p className={cn(textVariants({ variant, size }))}>{message}</p>
      </div>
    </>
  );
}
