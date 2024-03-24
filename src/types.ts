export type EditDeleteOperation = "edit" | "delete";

export type ModalProps<T> = {
  meta: T;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};
