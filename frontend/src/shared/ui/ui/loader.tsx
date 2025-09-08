import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "s" | "m" | "l";
  className?: string;
}

export const Loader = ({ size = "m", className }: LoaderProps) => {
  const sizeClasses = {
    s: "w-4 h-4",
    m: "w-8 h-8",
    l: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-t-primary",
          sizeClasses[size]
        )}
      />
    </div>
  );
};
