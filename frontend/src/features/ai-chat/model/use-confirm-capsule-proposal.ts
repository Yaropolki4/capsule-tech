import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CapsuleProposalDto } from "@capsule/common";
import { createClothesFromWildberries } from "@/entities/clothes";
import {
  createCapsule,
  stylizeCapsule,
  computeAutoLayout,
} from "@/entities/capsules";
import { useCurrentUser } from "@/entities/user-session";
import { queryClient } from "@/shared/query-client";
import { routes } from "@/shared/constants/routes";

export function useConfirmCapsuleProposal() {
  const router = useRouter();
  const [currentUser] = useCurrentUser();
  const [isConfirming, setIsConfirming] = useState(false);

  const confirm = async (proposal: CapsuleProposalDto) => {
    setIsConfirming(true);

    try {
      const clothes = await Promise.all(
        proposal.items.map((item) =>
          createClothesFromWildberries({
            name: item.name,
            brand: item.brand,
            description: item.description,
            photo: item.photo,
            url: item.url,
          })
        )
      );

      const layout = computeAutoLayout(clothes.length);
      const items = clothes.map((clothesItem, index) => ({
        clothesId: clothesItem.id,
        ...layout[index],
      }));

      const styledImageUrl = await stylizeCapsule(
        clothes.map((clothesItem) => clothesItem.imageUrl)
      );

      const capsule = await createCapsule({
        name: proposal.name,
        thumbnailUrl: styledImageUrl,
        items,
        public: true,
      });

      await queryClient.invalidateQueries({
        queryKey: ["clothes", currentUser?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["capsules", currentUser?.id],
      });

      router.push(routes.getCapsule(capsule.id));
    } catch {
      toast.error("Не получилось собрать капсулу, попробуй ещё раз");
    } finally {
      setIsConfirming(false);
    }
  };

  return { confirm, isConfirming };
}
