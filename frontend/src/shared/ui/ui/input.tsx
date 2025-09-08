/* eslint-disable max-len */
import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

const inputVariants = cva(
  "flex file:text-foreground placeholder:text-muted-foreground min-w-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructiv",
  {
    variants: {
      variant: {
        default:
          "dark:bg-input/30 border-input bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:bg-transparent focus-visible:border-ring focus-visible:ring-ring/50",
        destructive:
          "dark:bg-input/30 border-destructive bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:bg-transparent focus-visible:border-ring focus-visible:ring-destructive/20",
      },
      size: {
        default:
          "h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs file:h-7 file:border-0 file:text-sm file:font-medium md:text-sm focus-visible:ring-[3px]",
        s: "h-8 w-full rounded-md border px-3 py-1 text-sm shadow-xs file:h-7 file:border-0 file:text-sm file:font-medium md:text-sm focus-visible:ring-[3px]",
        m: "h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs file:h-7 file:border-0 file:text-sm file:font-medium md:text-sm focus-visible:ring-[3px]",
        l: "h-12 w-full rounded-md border px-4 py-1 text-base shadow-xs file:h-7 file:border-0 file:text-sm file:font-medium md:text-lg focus-visible:ring-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Input({
  className,
  asChild = false,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "input";

  return (
    <Comp
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input };
