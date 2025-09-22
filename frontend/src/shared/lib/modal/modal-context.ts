import { createStrictContext } from "../react/createStrictContext";
import type { ModalState } from "./modal-provider";

export const [ModalContext, useModalContext] =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createStrictContext<[(state: ModalState<any>) => void]>();
