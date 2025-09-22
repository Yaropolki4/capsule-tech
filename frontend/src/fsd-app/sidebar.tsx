"use client";
import { cn } from "@/lib/utils";
import { useModal } from "@/shared/lib/modal/use-modal";
import { Button } from "@/shared/ui/ui/button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

const CreateClothesForm = dynamic(
  () =>
    import("@/features/create-clothes-form").then(
      (mod) => mod.CreateClothesForm
    ),
  {
    ssr: false,
  }
);

export function Sidebar() {
  const { openModal } = useModal();

  return (
    <>
      <div
        className={cn(
          "bg-background border-border",
          "w-64 h-full border-r-2",
          "max-lg:w-20",
          "max-md:w-full max-md:h-20 max-md:border-t-2"
        )}
      >
        <Button
          onClick={() => openModal({ Component: CreateClothesForm, props: {} })}
          variant="outline"
          className="w-full"
        >
          <Plus />
          Добавить вещь
        </Button>
      </div>
    </>
  );
}
