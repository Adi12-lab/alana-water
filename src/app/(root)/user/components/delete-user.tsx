"use client";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { DataModal } from "../client";
import { ModalProps } from "~/types";
import { UserSafe } from "~/schema";
import { axiosInstance } from "~/lib/utils";
import { AxiosError } from "axios";

export default function DeleteUser({
  meta,
  isOpen,
  setIsOpen,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const userMutation = useMutation({
    mutationKey: ["delete-transaksi"],
    mutationFn: async (payload: UserSafe) => {
      return axiosInstance
        .delete("/api/user/" + payload.username)
        .then((data) => data.data);
    },
    onSuccess: () => {
      setIsOpen(false);
      toast.success(`User berhasil dihapus`);
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: (payload: AxiosError) => {
      if (payload.response) {
        toast.error(payload.response.statusText);
      }
    },
  });

  const handleDelete = () => {
    userMutation.mutate(meta.data);
  };

  return (
    <AlertDialog
      open={isOpen && meta.operation === "delete"}
      onOpenChange={setIsOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anda yakin ?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan menghapus user {meta && meta.data.username}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="default"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={userMutation.isPending}
            variant={"destructive"}
            onClick={handleDelete}
          >
            {userMutation.isPending ? (
              <React.Fragment>
                <Loader2 className="animate-spin" />
                Menghapus
              </React.Fragment>
            ) : (
              "Hapus"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
