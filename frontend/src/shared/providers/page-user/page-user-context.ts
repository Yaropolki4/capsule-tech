import { createStrictContext } from "@/shared/lib/react/createStrictContext";

export const [PageUserContext, usePageUser] = createStrictContext<string>();
