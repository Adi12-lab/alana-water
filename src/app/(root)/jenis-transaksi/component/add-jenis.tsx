"use client";
import React, { useState } from "react";
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
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { jenisTransaksiSchema, NewJenisTransaksi } from "~/schema";

export default function AddJenis() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewJenisTransaksi>({
    resolver: zodResolver(jenisTransaksiSchema),
    defaultValues: {
      harga: 0,
      nama: "",
    },
  });

  const jenisTransaksiMutation = useMutation({
    mutationKey: ["add-jenis-transaksi"],
    mutationFn: async (payload: NewJenisTransaksi) => {
      return axiosInstance
        .post("/api/jenis-transaksi", payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("Jenis Transaksi berhasil ditambahkan");
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["jenis-transaksi"] });
      form.reset();
    },
    onError: () => {
      toast.error("Jenis Transaksi gagal ditambahkan");
    },
  });

  const onSubmit = (values: NewJenisTransaksi) => {
    jenisTransaksiMutation.mutate(values);
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button variant={"outline"} onClick={() => setOpenModal(true)}>
          Tambah Jenis Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Jenis Transaksi</DialogTitle>
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
