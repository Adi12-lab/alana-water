"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { transaksiSchema, NewTransaksi } from "~/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";

import { DataModal } from "../../transaksi/client";
import { ModalProps } from "~/types";

export default function EditPengembalian({
  meta,
  isOpen,
  setIsOpen,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const form = useForm<NewTransaksi>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      jenisTransaksiId: 0,
      kuantitas: 0,
      namaPembeli: "",
      tanggal: new Date(),
      galonKembali: 0,
    },
  });

  useEffect(() => {
    if (meta && meta.data) {
      form.setValue("jenisTransaksiId", meta.data.jenisTransaksiId);
      form.setValue("kuantitas", meta.data.kuantitas);
      form.setValue("namaPembeli", meta.data.namaPembeli);
      form.setValue("tanggal", new Date(meta.data.tanggal));
      form.setValue("galonKembali", meta.data.galonKembali);
    }
  }, [form, meta]);

  const transaksiMutation = useMutation({
    mutationKey: ["edit-transaksi"],
    mutationFn: async (payload: NewTransaksi) => {
      return axiosInstance
        .put("/api/pengembalian/" + meta.data.kode, payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("Pengembalian berhasil diedit");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["pengembalian"] });
    },
    onError: () => {
      toast.error("Pengembalian gagal diedit");
    },
  });

  function onSubmit(values: NewTransaksi) {
    transaksiMutation.mutate(values);
  }

  return (
    <Dialog
      open={isOpen && meta.operation === "edit"}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        form.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengembalian</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="galonKembali"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Galon Kembali</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= form.getValues("kuantitas") && val >= 0) {
                          field.onChange(Number(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={transaksiMutation.isPending}>
              {transaksiMutation.isPending ? (
                <React.Fragment>Menyimpan</React.Fragment>
              ) : (
                <React.Fragment>Simpan</React.Fragment>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
