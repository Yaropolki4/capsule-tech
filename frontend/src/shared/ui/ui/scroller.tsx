export function Scroller({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="w-full h-full overflow-auto" ref={ref}>
      {children}
    </div>
  );
}
