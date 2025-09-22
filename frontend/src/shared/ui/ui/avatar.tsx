"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { CloudAlert } from "lucide-react";
import { useState } from "react";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export function AvatarSkeleton({ className }: { className: string }) {
  return <Skeleton data-slot="avatar-loading" className={cn(className)} />;
}

export function AvatarError() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <CloudAlert />;
    </div>
  );
}

export function AvatarContainer({
  url,
  className,
}: {
  url: Maybe<string>;
  className: string;
}) {
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  return (
    <Avatar className={cn("items-center justify-center", className)}>
      {url ? (
        <>
          {avatarStatus === "loading" || avatarStatus === "idle" ? (
            <AvatarSkeleton className="w-full h-full" />
          ) : null}
          {avatarStatus === "error" ? <AvatarError /> : null}
          <AvatarImage
            onLoadingStatusChange={setAvatarStatus}
            src={url}
            className={cn("none", avatarStatus === "loaded" && "block")}
          />
        </>
      ) : (
        <AvatarImage src="/images/default-avatar.png" />
      )}
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
