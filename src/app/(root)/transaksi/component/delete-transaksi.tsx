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
import { Transaksi } from "~/schema";
import { axiosInstance } from "~/lib/utils";

export default function DeleteTransaksi({
  meta,
  isOpen,
  setIsOpen,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const transaksiMutation = useMutation({
    mutationKey: ["delete-transaksi"],
    mutationFn: async (payload: Transaksi) => {
      return axiosInstance
        .delete("/api/transaksi/" + payload.kode)
        .then((data) => data.data);
    },
    onSuccess: () => {
      setIsOpen(false);
      toast.success(`Transaski berhasil dihapus`);
      queryClient.invalidateQueries({
        queryKey: ["transaksi"],
      });
    },
  });

  const handleDelete = () => {
    transaksiMutation.mutate(meta.data);
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
            Saat anda menghapus transaksi maka galon akan bertambah
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
            disabled={transaksiMutation.isPending}
            variant={"destructive"}
            onClick={handleDelete}
          >
            {transaksiMutation.isPending ? (
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
