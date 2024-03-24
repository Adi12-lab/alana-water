export type EditDeleteOperation = "edit" | "delete";

export type ModalProps<T> = {
  meta: T;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export type MetaPagination = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};
