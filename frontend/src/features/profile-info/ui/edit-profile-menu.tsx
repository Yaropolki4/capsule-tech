import type { User } from "@/entities/user-session";
import { editProfile, useCurrentUser, useUser } from "@/entities/user-session";
import { cn } from "@/lib/utils";
import { routes } from "@/shared/constants/routes";
import { useModal } from "@/shared/lib/modal/use-modal";
import { ensureBrowserDecodableImage } from "@/shared/lib/image/heic";
import { Button } from "@/shared/ui/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/ui/dialog";
import { Input } from "@/shared/ui/ui/input";
import { Label } from "@/shared/ui/ui/label";
import { TextCell } from "@/shared/ui/ui/text-cell";
import { EDIT_USER_ERROR_CAUSES } from "@capsule/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useHotkeys } from "react-hotkeys-hook";
import {
  AvatarContainer,
  AvatarError,
  AvatarSkeleton,
} from "@/shared/ui/ui/avatar";
import { EditPhotoEditor } from "./edit-phote-editor";

export type EditProfileMenuProps = {
  name: string;
  bio: string;
};

type EditProfileFormData = {
  name: string;
  bio: string;
};

const SERVER_ERROR_TIMEOUT = 5000;

const editProfileSchema = z.object({
  name: z.string().min(1, "Имя должно быть минимальной длины 1 символ"),
  bio: z.string("Описание должно быть строкой"),
});

function buildBody(name: string, bio: string) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("bio", bio);

  return formData;
}

export function EditProfileMenu({
  name: initialName,
  bio: initialBio,
}: EditProfileMenuProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
  });

  const [currentUser, setUser] = useCurrentUser();
  const { data: user, isLoading, error } = useUser(currentUser?.name ?? "");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<Maybe<string>>(undefined);
  const { closeModal } = useModal();

  useHotkeys<HTMLFormElement>(
    "enter",
    () => {
      handleSubmit(onSubmit)();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ["INPUT", "TEXTAREA"],
      ignoreEventWhen: (e) =>
        e.target instanceof HTMLInputElement && e.target.type === "file",
    }
  );

  function processErrors(
    cause: (typeof EDIT_USER_ERROR_CAUSES)[number] | "server",
    message: string
  ) {
    if (cause === "server") {
      setServerError(message);

      setTimeout(() => {
        setServerError(undefined);
      }, SERVER_ERROR_TIMEOUT);
    } else if ([...EDIT_USER_ERROR_CAUSES].includes(cause)) {
      setError(cause, {
        message,
      });

      return;
    }
  }

  async function processSuccess(editedUser: Pick<User, "name">, oldUser: User) {
    setUser({
      ...oldUser,
      ...editedUser,
    });

    if (editedUser.name !== initialName) {
      router.push(routes.getProfile(editedUser.name));
    }

    await queryClient.invalidateQueries({ queryKey: ["user", initialName] });
    closeModal();
  }

  const onSubmit = async ({ name, bio }: EditProfileFormData) => {
    const body = buildBody(name, bio);
    const result = await editProfile(initialName, body);

    if (result.data && currentUser) {
      processSuccess(result.data, currentUser);

      return;
    }

    processErrors(
      result.error?.cause ?? "server",
      result.error?.message ?? "Unknown error"
    );
  };

  const errorMessage =
    errors.bio?.message ?? errors.name?.message ?? serverError;

  const inputRef = useRef<HTMLInputElement>(null);
  const { openModal } = useModal();

  return (
    <DialogContent
      aria-describedby="edit-profile-modal"
      className="sm:max-w-[425px]"
    >
      <DialogHeader className="mb-2">
        <DialogTitle>Редактирование профиля</DialogTitle>
      </DialogHeader>
      <div className="relative">
        <div
          className={cn(
            "mb-8 transition-opacity duration-500 opacity-100 absolute -top-5 w-full",
            !errorMessage && "invisible opacity-0"
          )}
        >
          <TextCell message={errorMessage ?? "invisible"} size="s" />
        </div>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <div
            className={cn(
              "flex gap-2 w-full justify-between items-center p-2 bg-muted",
              "border border-border rounded-md"
            )}
          >
            {isLoading ? (
              <AvatarSkeleton className="w-12 h-12" />
            ) : error ? (
              <AvatarError />
            ) : (
              <AvatarContainer
                url={user?.data?.avatarUrl}
                className="w-12 h-12"
              />
            )}
            <Button
              onClick={() => {
                inputRef.current?.click();
              }}
              size="s"
            >
              Изменить фото
            </Button>
            <Input
              className="hidden"
              id="file"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
              ref={inputRef}
              onChange={async (e) => {
                const file = e.target.files?.[0] ?? null;

                openModal({
                  Component: EditPhotoEditor,
                  props: {
                    image: file ? await ensureBrowserDecodableImage(file) : file,
                  },
                });
              }}
            />
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="name">Имя пользователя</Label>
          <Input
            {...register("name")}
            id="name"
            name="name"
            defaultValue={initialName}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="bio">Описание</Label>
          <Input
            {...register("bio")}
            id="bio"
            name="bio"
            defaultValue={initialBio}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={closeModal} disabled={isSubmitting} variant="outline">
          Отменить
        </Button>
        <Button
          type="submit"
          disabled={Boolean(isSubmitting || errorMessage)}
          onClick={handleSubmit(onSubmit)}
        >
          Сохранить
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
