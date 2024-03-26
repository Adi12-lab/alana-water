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
import { DataModal } from "../page";
import { ModalProps } from "~/types";
import { JenisTransaksi } from "~/schema";
import { axiosInstance } from "~/lib/utils";

export default function DeleteJenis({
  meta,
  isOpen,
  setIsOpen,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const jenisTransaksiMutation = useMutation({
    mutationKey: ["delete-jenis-transaksi"],
    mutationFn: async (payload: JenisTransaksi) => {
      return axiosInstance
        .delete("/api/jenis-transaksi/" + payload.id)
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
    jenisTransaksiMutation.mutate(meta.data);
  };

  return (
    <AlertDialog
      open={isOpen && meta.operation === "delete"}
      onOpenChange={setIsOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Anda yakin menghapus {meta.data.nama}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Pastikan jenis transaksi ini belum pernah dipakai
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
            disabled={jenisTransaksiMutation.isPending}
            variant={"destructive"}
            onClick={handleDelete}
          >
            {jenisTransaksiMutation.isPending ? (
              <React.Fragment>
                <Loader2 />
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
