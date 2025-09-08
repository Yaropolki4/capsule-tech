import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { AlertCircle } from "lucide-react";

const textCellVariants = cva(
  "flex items-center justify-start rounded-lg p-3 gap-2",
  {
    variants: {
      variant: {
        destructive: "bg-destructive/5 border border-destructive/10",
      },
    },
    defaultVariants: {
      variant: "destructive",
    },
  }
);

const textVariants = cva("", {
  variants: {
    variant: {
      destructive: "text-destructive font-medium",
    },
  },
});

export function TextCell({
  message,
  variant = "destructive",
}: VariantProps<typeof textCellVariants> & {
  message: React.ReactNode;
}) {
  return (
    <>
      <div className={cn(textCellVariants({ variant }))}>
        {variant === "destructive" ? (
          <div>
            <AlertCircle color="var(--destructive)" className="size-4" />
          </div>
        ) : null}
        <p className={cn(textVariants({ variant }))}>{message}</p>
      </div>
    </>
  );
}
