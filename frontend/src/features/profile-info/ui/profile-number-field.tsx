export function ProfileNumberField({
  number,
  label,
  onClick,
}: {
  number: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div className="text-lg font-medium cursor-pointer" onClick={onClick}>
      {number} <span className="text-muted-foreground text-base">{label}</span>
    </div>
  );
}
