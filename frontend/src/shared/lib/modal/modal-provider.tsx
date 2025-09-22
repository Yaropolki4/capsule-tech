import { Dialog } from "@/shared/ui/ui/dialog";
import { useState, type JSX } from "react";
import { ModalContext } from "./modal-context";

export type ModalState<T extends JSX.IntrinsicAttributes> = {
  Component: ((props: T) => React.ReactNode) | React.ComponentType<T>;
  props: T;
  open: boolean;
};

export function ModalProvider<T>({ children }: React.PropsWithChildren) {
  const [modalProps, setModalProps] = useState<
    ModalState<T & JSX.IntrinsicAttributes>
  >({
    open: false,
    Component: () => null,
    props: {} as T & JSX.IntrinsicAttributes,
  });

  const { open, Component, props } = modalProps;
  const setOpen = (open: boolean) => {
    setModalProps({ ...modalProps, open });
  };

  return (
    <ModalContext.Provider value={[setModalProps]}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        {open && <Component {...props} />}
      </Dialog>
    </ModalContext.Provider>
  );
}
