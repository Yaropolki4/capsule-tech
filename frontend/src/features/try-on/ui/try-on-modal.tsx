"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/ui/dialog";
import { Button } from "@/shared/ui/ui/button";
import { Input } from "@/shared/ui/ui/input";
import { Loader } from "@/shared/ui/ui/loader";
import { TextCell } from "@/shared/ui/ui/text-cell";
import { useModal } from "@/shared/lib/modal/use-modal";
import { useCurrentUser } from "@/entities/user-session";
import {
  useUserPhotos,
  uploadUserPhoto,
  type UserPhoto,
} from "@/entities/user-photos";
import { createTryOn, type TryOn } from "@/entities/try-on";
import {
  describeInsufficientTokensError,
  TOKEN_BALANCES_QUERY_KEY,
} from "@/entities/billing";
import { queryClient } from "@/shared/query-client";
import { routes } from "@/shared/constants/routes";
import { ensureBrowserDecodableImage } from "@/shared/lib/image/heic";
import { cn } from "@/lib/utils";

type Step = "photo" | "confirm" | "result";

export function TryOnModal({
  clothesId,
  capsuleId,
  previewImageUrl,
}: {
  clothesId?: string;
  capsuleId?: string;
  previewImageUrl: string;
}) {
  const { closeModal } = useModal();
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("photo");
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TryOn | null>(null);
  const [error, setError] = useState<Maybe<string>>(undefined);

  const { data: photos, isLoading: photosLoading } = useUserPhotos(
    currentUser?.id
  );

  const onSelectPhoto = (photo: UserPhoto) => {
    setSelectedPhoto(photo);
    setStep("confirm");
  };

  const onUpload = async (file: File | null) => {
    if (!file || !currentUser) return;

    setIsUploading(true);
    setError(undefined);

    try {
      const photo = await uploadUserPhoto(await ensureBrowserDecodableImage(file));

      await queryClient.invalidateQueries({
        queryKey: ["user-photos", currentUser.id],
      });

      setSelectedPhoto(photo);
      setStep("confirm");
    } catch {
      setError("Не удалось загрузить фото, попробуйте позже");
    } finally {
      setIsUploading(false);
    }
  };

  const onTryOn = async () => {
    if (!selectedPhoto || !currentUser) return;

    setIsGenerating(true);
    setError(undefined);

    try {
      const tryOn = await createTryOn({
        userPhotoId: selectedPhoto.id,
        clothesId,
        capsuleId,
      });

      await queryClient.invalidateQueries({
        queryKey: ["try-ons", currentUser.id],
      });
      await queryClient.invalidateQueries({
        queryKey: TOKEN_BALANCES_QUERY_KEY,
      });

      setResult(tryOn);
      setStep("result");
    } catch (error) {
      setError(
        describeInsufficientTokensError(error) ??
          "Не удалось выполнить примерку, попробуйте позже"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogContent className="flex flex-col gap-4 h-[600px] max-sm:h-[500px]">
      {step === "photo" && (
        <>
          <DialogHeader>
            <DialogTitle>Выберите фото</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground rounded-md bg-secondary p-3">
            Для лучшего результата используйте фото в полный рост, с
            нейтральным фоном, хорошим освещением, лицом к камере.
          </div>
          {error && <TextCell message={error} size="s" />}
          <div className="grow overflow-y-auto">
            {photosLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos?.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onSelectPhoto(photo)}
                    className={cn(
                      "relative rounded-[var(--radius-card)] overflow-hidden",
                      "border-2 border-transparent hover:border-primary transition-colors"
                    )}
                    style={{ aspectRatio: 3 / 4 }}
                  >
                    <Image
                      src={photo.imageUrl}
                      alt="Фото"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1",
                    "rounded-[var(--radius-card)] border-2 border-dashed border-border text-muted-foreground",
                    "hover:border-primary hover:text-foreground transition-colors"
                  )}
                  style={{ aspectRatio: 3 / 4 }}
                >
                  {isUploading ? (
                    <Loader size="s" />
                  ) : (
                    <Plus className="size-6" />
                  )}
                  <span className="text-xs">Загрузить фото</span>
                </button>
              </div>
            )}
          </div>
          <Input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
            className="hidden"
            onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
          />
        </>
      )}

      {step === "confirm" && selectedPhoto && (
        <>
          <DialogHeader>
            <DialogTitle>Примерка</DialogTitle>
          </DialogHeader>
          {error && <TextCell message={error} size="s" />}
          <div className="grow flex items-center justify-center gap-4">
            <div
              className="relative h-full rounded-[var(--radius-card)] overflow-hidden"
              style={{ aspectRatio: 3 / 4 }}
            >
              <Image
                src={selectedPhoto.imageUrl}
                alt="Ваше фото"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-muted-foreground text-xl">+</span>
            <div
              className="relative h-full rounded-[var(--radius-card)] overflow-hidden"
              style={{ aspectRatio: 3 / 4 }}
            >
              <Image
                src={previewImageUrl}
                alt="Вещь"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStep("photo")}
              disabled={isGenerating}
            >
              Назад
            </Button>
            <Button onClick={onTryOn} disabled={isGenerating}>
              {isGenerating ? <Loader size="s" /> : "Примерить"}
            </Button>
          </DialogFooter>
        </>
      )}

      {step === "result" && result && (
        <>
          <DialogHeader>
            <DialogTitle>Готово!</DialogTitle>
          </DialogHeader>
          <div className="grow relative rounded-[var(--radius-card)] overflow-hidden">
            <Image
              src={result.resultImageUrl}
              alt="Результат примерки"
              fill
              className="object-contain"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Закрыть
            </Button>
            <Button
              onClick={() => {
                closeModal();
                router.push(routes.fittingRoom);
              }}
            >
              Открыть примерочную
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}
