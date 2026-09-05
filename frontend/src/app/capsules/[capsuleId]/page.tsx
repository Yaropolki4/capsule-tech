import { CapsuleDetail } from "@/fsd-pages/capsule-detail";

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ capsuleId: string }>;
}) {
  const { capsuleId } = await params;

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
      <CapsuleDetail capsuleId={capsuleId} />
    </div>
  );
}
