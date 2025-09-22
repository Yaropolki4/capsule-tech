export function ProfileNumberField({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <div className="text-lg font-medium cursor-pointer">
      {number} <span className="text-muted-foreground text-base">{label}</span>
    </div>
  );
}
