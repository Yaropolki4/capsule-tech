import { httpTransport } from "@/shared/api/http-transport";
import {
  createCapsuleResponseDtoSchema,
  type CreateCapsuleRequestDto,
} from "@capsule/common";
import type { Capsule } from "../model/types";

function deserializeCapsule(capsule: unknown): Capsule {
  const parsed = createCapsuleResponseDtoSchema.parse(capsule);

  return {
    id: parsed.id,
    name: parsed.name,
    thumbnailUrl: parsed.thumbnailUrl,
    public: parsed.public,
    createdById: parsed.createdById,
    createdAt: parsed.createdAt,
  };
}

export const createCapsule = async (data: CreateCapsuleRequestDto) => {
  return deserializeCapsule(
    await httpTransport.post("/capsule", {
      json: data,
      params: {
        withAuth: true,
      },
    })
  );
};
