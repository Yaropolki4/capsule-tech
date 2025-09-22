import type { ModalState } from "./modal-provider";
import { useModalContext } from "./modal-context";
import type { JSX } from "react";

export function useModal() {
  const [setModalState] = useModalContext();

  return {
    openModal: <T>(
      state: Pick<
        ModalState<T & JSX.IntrinsicAttributes>,
        "Component" | "props"
      >
    ) => {
      setModalState({ ...state, open: true });
    },
    closeModal: <T>() => {
      setModalState({ open: false, Component: () => null, props: {} as T });
    },
  };
}
