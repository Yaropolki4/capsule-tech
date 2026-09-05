import { AiStylist } from "@/fsd-pages/ai-stylist";

export default async function AiStylistThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
      <AiStylist threadId={threadId} />
    </div>
  );
}
