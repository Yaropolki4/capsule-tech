"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { Button } from "@/shared/ui/ui/button";
import { routes } from "@/shared/constants/routes";

const STORAGE_KEY = "capsule:photo-upload-consent";

function hasConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveConsent() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {}
}

/**
 * Перед первой загрузкой фото показывает окно согласия.
 * `withConsent(action)` выполняет action сразу, если согласие уже дано,
 * иначе — после нажатия «Согласен(на) и продолжить».
 * `consentDialog` нужно отрендерить в компоненте.
 */
export function usePhotoConsent() {
  const [open, setOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const withConsent = (action: () => void) => {
    if (hasConsent()) {
      action();

      return;
    }

    pendingAction.current = action;
    setOpen(true);
  };

  const accept = () => {
    saveConsent();
    setOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  };

  const consentDialog = (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) pendingAction.current = null;
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Загрузка фотографии</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Загружая фотографию, я подтверждаю, что имею право на её
            использование, и даю согласие на её обработку в целях работы
            функционала сайта Capsule AI.
          </DialogDescription>
        </DialogHeader>
        <Link
          href={routes.privacy}
          target="_blank"
          className="text-brand-accent-text text-sm underline underline-offset-2 hover:no-underline"
        >
          Политика обработки персональных данных
        </Link>
        <DialogFooter>
          <Button onClick={accept}>Согласен(на) и продолжить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { withConsent, consentDialog };
}
