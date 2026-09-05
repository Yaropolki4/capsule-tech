import Image from "next/image";
import { DialogContent, DialogTitle } from "@/shared/ui/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function TryOnFullscreenModal({
  imageUrl,
  caption,
}: {
  imageUrl: string;
  caption: string;
}) {
  return (
    <DialogContent
      showCloseButton
      className="p-0 border-none shadow-none bg-transparent"
      style={{ width: "min(92vw, 88vh)", height: "min(92vw, 88vh)" }}
    >
      <VisuallyHidden>
        <DialogTitle>{caption}</DialogTitle>
      </VisuallyHidden>
      <div className="relative w-full h-full rounded-[var(--radius-card)] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={caption}
          fill
          className="object-contain"
          sizes="92vw"
        />
      </div>
    </DialogContent>
  );
}
