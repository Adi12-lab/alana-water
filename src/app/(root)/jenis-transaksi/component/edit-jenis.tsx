"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { jenisTransaksiSchema, JenisTransaksi } from "~/schema";
import { ModalProps } from "~/types";
import { DataModal } from "../page";

export default function EditJenis({
  meta,
  isOpen,
  setIsOpen,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const form = useForm<JenisTransaksi>({
    resolver: zodResolver(jenisTransaksiSchema),
    defaultValues: {
      harga: 0,
      nama: "",
    },
  });

  useEffect(() => {
    if (meta.data) {
      form.setValue("nama", meta.data.nama);
      form.setValue("harga", meta.data.harga);
    }
  }, [form, meta.data]);

  const jenisTransaksiMutation = useMutation({
    mutationKey: ["edit-jenis-transaksi"],
    mutationFn: async (payload: JenisTransaksi) => {
      return axiosInstance
        .put("/api/jenis-transaksi/" + meta.data.id, payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("Jenis Transaksi berhasil diedit");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["jenis-transaksi"] });
      form.reset();
    },
    onError: () => {
      toast.error("Jenis Transaksi gagal diedit");
    },
  });

  const onSubmit = (values: JenisTransaksi) => {
    jenisTransaksiMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen && meta.operation === "edit"} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Jenis Transaksi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Transaksi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="harga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Saat anda mengubah harga, transaksi yang memakai harga lama
                    tetap ada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={jenisTransaksiMutation.isPending}>
              {jenisTransaksiMutation.isPending ? (
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
