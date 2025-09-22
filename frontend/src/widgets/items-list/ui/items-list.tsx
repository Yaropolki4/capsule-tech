import { CapsulesList } from "@/features/capsules";
import { ClothesList } from "@/features/clothes";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/ui/tabs";
import { Pill, Shirt } from "lucide-react";
import { useState } from "react";

const lanes = 3;

export function ItemsList({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [activeTab, setActiveTab] = useState("clothes");

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="capsules"
        className="flex justify-center flex-row"
      >
        <TabsList className="gap-20 pb-0">
          <TabsTrigger value="capsules">
            <Pill strokeWidth={1.5} className="size-6" />
          </TabsTrigger>
          <TabsTrigger value="clothes">
            <Shirt strokeWidth={1.5} className="size-6" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="px-30 max-md:px-10 max-sm:px-4">
        {activeTab === "capsules" && (
          <CapsulesList parentRef={parentRef} lanes={lanes} />
        )}
        {activeTab === "clothes" && (
          <ClothesList parentRef={parentRef} lanes={lanes} />
        )}
      </div>
    </>
  );
}
