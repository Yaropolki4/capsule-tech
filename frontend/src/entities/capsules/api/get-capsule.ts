import { httpTransport } from "@/shared/api/http-transport";
import { getCapsuleResponseDtoSchema } from "@capsule/common";
import type { CapsuleDetail } from "../model/types";

function deserializeCapsuleDetail(capsule: unknown): CapsuleDetail {
  return getCapsuleResponseDtoSchema.parse(capsule);
}

export const getCapsule = async (id: string) => {
  return deserializeCapsuleDetail(
    await httpTransport.get(`/capsule/${id}`, {
      params: {
        withAuth: true,
      },
    })
  );
};
