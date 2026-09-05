"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import type { PostFeedItem } from "@/entities/posts";
import { mapCategoryToLabel } from "@/entities/clothes";
import { AvatarContainer } from "@/shared/ui/ui/avatar";
import { Badge } from "@/shared/ui/ui/badge";
import { Eyebrow } from "@/shared/ui/ui/eyebrow";
import { CAPSULE_CANVAS_ASPECT_RATIO } from "@/shared/constants/capsule";
import { routes } from "@/shared/constants/routes";
import { useModal } from "@/shared/lib/modal/use-modal";
// eslint-disable-next-line boundaries/element-types
import { TryOnModal } from "@/features/try-on";
import { useTogglePostLikeMutation } from "../model/use-toggle-post-like-mutation";
import { cn } from "@/lib/utils";

const ACTION_PILL_CLASS =
  "flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs text-muted-foreground cursor-pointer";

function formatRelativeTime(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "только что";

  if (diffHours < 24) return `${diffHours} ч назад`;

  if (diffHours < 48) return "вчера";

  return `${Math.floor(diffHours / 24)} дн назад`;
}

export function PostCard({ post }: { post: PostFeedItem }) {
  const { openModal } = useModal();
  const toggleLikeMutation = useTogglePostLikeMutation();

  const tryOnPreviewImageUrl = post.capsule?.thumbnailUrl ?? post.clothes?.imageUrl;

  return (
    <div className="w-full pb-4 pr-1">
      <div className="border border-border rounded-[var(--radius-card)] p-4 flex flex-col gap-3">
        <Link
          href={routes.getProfile(post.createdBy.name)}
          className="flex items-center gap-3 w-fit"
        >
          <AvatarContainer
            url={post.createdBy.avatarUrl}
            className="size-10"
          />
          <div className="flex flex-col">
            <div className="font-medium">{post.createdBy.name}</div>
            <Eyebrow>{formatRelativeTime(post.createdAt)}</Eyebrow>
          </div>
        </Link>

        {post.text && <p className="whitespace-pre-wrap">{post.text}</p>}

        {post.capsule && (
          <Link
            href={routes.getCapsule(post.capsule.id)}
            className="block w-full max-w-xs"
          >
            <div
              className="relative w-full rounded-[var(--radius-card)] overflow-hidden bg-muted"
              style={{ aspectRatio: CAPSULE_CANVAS_ASPECT_RATIO }}
            >
              <Image
                src={post.capsule.thumbnailUrl}
                alt={post.capsule.name ?? "Капсула"}
                fill
                className="object-cover"
              />
            </div>
            {post.capsule.name && (
              <div className="font-medium mt-2">{post.capsule.name}</div>
            )}
          </Link>
        )}

        {post.clothes && (
          <div className="flex items-center gap-3">
            <div className="relative size-24 rounded-[var(--radius-card)] overflow-hidden bg-muted shrink-0">
              <Image
                src={post.clothes.imageUrl}
                alt={post.clothes.brand ?? "Вещь"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" size="m">
                {post.clothes.brand ?? "Без бренда"}
              </Badge>
              <Badge variant="secondary" size="m">
                {mapCategoryToLabel[post.clothes.category]}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={toggleLikeMutation.isPending}
            onClick={() =>
              toggleLikeMutation.mutate({
                postId: post.id,
                liked: !post.isLikedByMe,
              })
            }
            className={cn(
              "flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs cursor-pointer",
              post.isLikedByMe ? "text-brand-accent-text" : "text-muted-foreground"
            )}
          >
            <Heart className={cn("size-4", post.isLikedByMe && "fill-current")} />
            {post.likesCount > 0 ? post.likesCount : "Нравится"}
          </button>
          {tryOnPreviewImageUrl && (
            <button
              type="button"
              onClick={() =>
                openModal({
                  Component: TryOnModal,
                  props: {
                    capsuleId: post.capsule?.id,
                    clothesId: post.clothes?.id,
                    previewImageUrl: tryOnPreviewImageUrl,
                  },
                })
              }
              className={ACTION_PILL_CLASS}
            >
              <Sparkles className="size-4" />
              Примерить на себе
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
