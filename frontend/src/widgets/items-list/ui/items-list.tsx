import { CapsulesList } from "@/features/capsules";
import { ClothesList } from "@/features/clothes";
import { UserPostsFeed } from "@/features/posts-feed";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/ui/tabs";
import { useState } from "react";

const lanes = 3;

export function ItemsList({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [activeTab, setActiveTab] = useState("capsules");

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex justify-center flex-row"
      >
        <TabsList className="gap-8 pb-0">
          <TabsTrigger value="capsules">Капсулы</TabsTrigger>
          <TabsTrigger value="clothes">Вещи</TabsTrigger>
          <TabsTrigger value="posts">Посты</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="px-30 max-md:px-10 max-sm:px-4">
        {activeTab === "capsules" && (
          <CapsulesList parentRef={parentRef} lanes={lanes} />
        )}
        {activeTab === "clothes" && (
          <ClothesList parentRef={parentRef} lanes={lanes} />
        )}
        {activeTab === "posts" && <UserPostsFeed parentRef={parentRef} />}
      </div>
    </>
  );
}
