import { cn } from "@/lib/utils";

const STRENGTH_LABELS = ["слабый пароль", "средний пароль", "надёжный пароль"];

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score++;

  if (/[0-9]/.test(password) && /[a-zA-Zа-яёА-ЯЁ]/.test(password)) score++;

  if (/[A-ZА-ЯЁ]/.test(password) || /[^a-zA-Zа-яёА-ЯЁ0-9]/.test(password)) score++;

  return score as 0 | 1 | 2 | 3;
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="flex items-center gap-2">
      <span className="flex flex-1 gap-1">
        {[0, 1, 2].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full",
              segment < strength ? "bg-primary" : "bg-secondary"
            )}
          />
        ))}
      </span>
      <span className="text-muted-foreground text-xs">
        {STRENGTH_LABELS[Math.max(strength - 1, 0)]}
      </span>
    </div>
  );
}
