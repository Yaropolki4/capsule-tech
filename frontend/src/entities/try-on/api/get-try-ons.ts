import { httpTransport } from "@/shared/api/http-transport";
import { getTryOnsResponseDtoSchema } from "@capsule/common";
import type { TryOn } from "../model/types";

function deserializeTryOns(data: unknown): TryOn[] {
  return getTryOnsResponseDtoSchema.parse(data);
}

export const getTryOns = async () => {
  return deserializeTryOns(
    await httpTransport.get("/try-on", {
      params: {
        withAuth: true,
      },
    })
  );
};
