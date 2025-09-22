import { Input } from "@/shared/ui/ui/input";
import { Label } from "@/shared/ui/ui/label";
import Image from "next/image";
import { CategorySelectionMenu } from "./category-selection-menu";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/shared/lib/modal/use-modal";
import { z } from "zod";
import type { ClothesCategory } from "@capsule/common";
import { clothesCategorySchema } from "@capsule/common";
import { Button } from "@/shared/ui/ui/button";
import { DialogFooter } from "@/shared/ui/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClothes } from "@/entities/clothes";
import { queryClient } from "@/shared/query-client";
import { Ban } from "lucide-react";
import { TextCell } from "@/shared/ui/ui/text-cell";

const createClothesSchema = z.object({
  brand: z.string().min(1, "Введите бренд"),
  category: clothesCategorySchema,
});

type CreateClothesFormSubmitStepData = z.infer<typeof createClothesSchema>;

function buildBody(
  brand: string,
  category: ClothesCategory,
  file: FileList[number]
) {
  const formData = new FormData();
  formData.append("brand", brand);
  formData.append("category", category);

  if (file) {
    formData.append("file", file);
  }

  return formData;
}

export function CreateClothesFormSubmitStep({
  onBackClick,
  image,
  url,
}: {
  onBackClick: () => void;
  image: File | null;
  url: string | null;
}) {
  const { closeModal } = useModal();
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const [imageError, setImageErorr] = useState<Maybe<string>>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateClothesFormSubmitStepData>({
    resolver: zodResolver(createClothesSchema),
  });

  const onSubmit = async (data: CreateClothesFormSubmitStepData) => {
    if (!image) {
      setImageErorr("Изображение не найдено");

      return;
    }

    const body = buildBody(data.brand, data.category, image);

    try {
      await createClothes(body);
      await queryClient.invalidateQueries({ queryKey: ["my-clothes"] });
    } catch {
      setServerError("Ошибка сервера, попробуйте позже");
    }

    closeModal();
  };

  const errorMessage =
    errors.brand?.message ??
    errors.category?.message ??
    imageError ??
    serverError;

  return (
    <>
      <div className="relative">
        <div className="absolute w-full">
          {errorMessage && <TextCell message={errorMessage} size="s" />}
        </div>
      </div>
      <div className="grow relative">
        <div className="w-full h-full absolute">
          <div className="flex items-center justify-center max-sm:justify-around w-full h-full gap-2">
            <div
              className="h-5/6 flex items-center justify-center"
              style={{ aspectRatio: 3 / 4 }}
            >
              {url ? (
                <Image
                  src={url}
                  alt="Image"
                  width={300}
                  height={300}
                  objectFit="contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                  <Ban className="w-10 h-10" />
                  Изображение не найдено
                </div>
              )}
            </div>
            <div>
              <div className="mb-4">
                <Label className="mb-2" htmlFor="brand">
                  Бренд
                </Label>
                <Input
                  {...register("brand")}
                  id="brand"
                  placeholder="Введите бренд"
                />
              </div>
              <Label className="mb-2" htmlFor="category">
                Категория
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <CategorySelectionMenu value={value} onChange={onChange} />
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className={cn(!url && "hidden")}>
        <Button onClick={onBackClick} variant="outline" disabled={isSubmitting}>
          Назад
        </Button>
        <Button
          disabled={!url || isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          Добавить
        </Button>
      </DialogFooter>
    </>
  );
}
