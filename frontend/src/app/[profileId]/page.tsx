import { Profile } from "@/fsd-pages/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center max-md:p-4">
      <Profile pageUserName={profileId} />
    </div>
  );
}
