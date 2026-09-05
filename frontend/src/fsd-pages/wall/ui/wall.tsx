"use client";

import { useRef } from "react";
import { PenLine } from "lucide-react";
import { Scroller } from "@/shared/ui/ui/scroller";
import { Button } from "@/shared/ui/ui/button";
import { useModal } from "@/shared/lib/modal/use-modal";
import { CreatePostForm } from "@/features/create-post";
import { PostsFeed } from "@/features/posts-feed";

export function Wall() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModal();

  return (
    <div className="bg-background w-full h-full flex flex-col overflow-scroll items-center">
      <Scroller ref={parentRef}>
        <div className="max-w-2xl w-full mx-auto px-4 pt-4">
          <Button
            variant="outline"
            fullWidth
            className="mb-4 justify-start"
            onClick={() =>
              openModal({ Component: CreatePostForm, props: {} })
            }
          >
            <PenLine />
            Написать пост
          </Button>
          <PostsFeed parentRef={parentRef} />
        </div>
      </Scroller>
    </div>
  );
}
