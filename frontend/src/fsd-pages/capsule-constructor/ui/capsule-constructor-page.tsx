"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CapsuleCanvas,
  ClothesPicker,
  LayerControls,
  PlacedItem,
  PublishButton,
  StylizeButton,
  useCanvasActions,
  useCanvasItems,
  useCanvasStep,
  useStyledImageUrl,
} from "@/features/capsule-constructor";
import { useClothes } from "@/entities/clothes";
import { useCurrentUser } from "@/entities/user-session";
import { routes } from "@/shared/constants/routes";
import { CAPSULE_CANVAS_ASPECT_RATIO } from "@/shared/constants/capsule";
import { Input } from "@/shared/ui/ui/input";
import { Eyebrow } from "@/shared/ui/ui/eyebrow";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/lib/utils";

export function CapsuleConstructorPage() {
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const { data: clothes } = useClothes(currentUser?.id);
  const items = useCanvasItems();
  const step = useCanvasStep();
  const styledImageUrl = useStyledImageUrl();
  const { selectItem, backToEdit, addItem, updateTransform } =
    useCanvasActions();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");

  const clothesById = useMemo(
    () => new Map((clothes ?? []).map((item) => [item.id, item])),
    [clothes]
  );

  const canvasItems = Object.values(items);
  const itemImageUrls = canvasItems
    .map((item) => clothesById.get(item.clothesId)?.imageUrl)
    .filter((url): url is string => Boolean(url));
  const isResultStep = step === "result" && Boolean(styledImageUrl);

  return (
    <div className="w-full h-full overflow-hidden flex justify-center p-4">
      <div
        className={cn(
          "w-full h-full max-w-5xl grid grid-cols-1 gap-6 min-h-0",
          !isResultStep && "grid-rows-[1fr_1fr] lg:grid-rows-1 lg:grid-cols-[1fr_320px]"
        )}
      >
        <div className="flex flex-col gap-4 min-w-0 h-full min-h-0">
          <div className="flex items-center justify-between gap-4 shrink-0">
            <h1 className="font-heading text-xl font-bold">Новая капсула</h1>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center">
            <div
              className="relative h-full max-w-full"
              style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
            >
              {isResultStep ? (
                <div
                  data-capsule-canvas
                  className="relative w-full h-full bg-muted rounded-[var(--radius-container)] overflow-hidden"
                >
                  <Image
                    src={styledImageUrl!}
                    alt="Оформленная капсула"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <>
                  <CapsuleCanvas
                    canvasRef={canvasRef}
                    items={canvasItems}
                    className="w-full h-full"
                    onCanvasClick={() => selectItem(null)}
                    onDropClothes={(clothesId, position) => {
                      addItem(clothesId);
                      updateTransform(clothesId, position);
                    }}
                    emptyState={
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          "pointer-events-none px-6 text-center text-sm",
                          "text-muted-foreground"
                        )}
                      >
                        Перетащите вещи
                      </div>
                    }
                    renderItem={(item) => {
                      const clothesItem = clothesById.get(item.clothesId);

                      if (!clothesItem) {
                        return null;
                      }

                      return (
                        <PlacedItem
                          item={item}
                          imageUrl={clothesItem.imageUrl}
                          canvasRef={canvasRef}
                        />
                      );
                    }}
                  />

                  <div className="absolute left-1/2 bottom-4 -translate-x-1/2">
                    <LayerControls />
                  </div>
                </>
              )}
            </div>
          </div>

          {isResultStep ? (
            <Button
              variant="outline"
              fullWidth
              size="l"
              className="shrink-0"
              onClick={backToEdit}
            >
              Назад к редактированию
            </Button>
          ) : (
            <StylizeButton
              itemImageUrls={itemImageUrls}
              disabled={itemImageUrls.length === 0}
            />
          )}

          <Input
            placeholder="Название капсулы (необязательно)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="shrink-0"
          />

          <div className="shrink-0 flex flex-col gap-2">
            <PublishButton
              canvasRef={canvasRef}
              name={name}
              isPublic
              onPublished={(capsuleId) =>
                router.push(routes.getCapsule(capsuleId))
              }
            />
            <PublishButton
              canvasRef={canvasRef}
              name={name}
              isPublic={false}
              variant="outline"
              onPublished={(capsuleId) =>
                router.push(routes.getCapsule(capsuleId))
              }
            />
          </div>
        </div>

        {!isResultStep && (
          <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
            <Eyebrow className="shrink-0">Гардероб</Eyebrow>
            <ClothesPicker />
          </div>
        )}
      </div>
    </div>
  );
}
