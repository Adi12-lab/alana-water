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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { transaksiSchema, NewTransaksi, JenisTransaksi } from "~/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";

import { DataModal } from "../client";
import { ModalProps } from "~/types";
import { AxiosError } from "axios";

export default function EditTransaksi({
  meta,
  isOpen,
  setIsOpen,
  galon,
}: ModalProps<DataModal> & { galon: number }) {
  const queryClient = useQueryClient();
  const form = useForm<NewTransaksi>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      jenisTransaksiId: 0,
      kuantitas: 0,
      namaPembeli: "",
      tanggal: new Date(),
    },
  });

  useEffect(() => {
    if (meta && meta.data) {
      form.setValue("jenisTransaksiId", meta.data.jenisTransaksiId);
      form.setValue("kuantitas", meta.data.kuantitas);
      form.setValue("namaPembeli", meta.data.namaPembeli);
      form.setValue("tanggal", new Date(meta.data.tanggal));
    }
  }, [form.formState.errors, meta]);

  const { data = [] } = useQuery<JenisTransaksi[]>({
    queryKey: ["jenis-transaksi"],
    queryFn: async () => {
      return axiosInstance
        .get("/api/jenis-transaksi")
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const transaksiMutation = useMutation({
    mutationKey: ["edit-transaksi"],
    mutationFn: async (payload: NewTransaksi) => {
      return axiosInstance
        .put("/api/transaksi/" + meta.data.kode, payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("Transaksi berhasil diedit");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["jumlah-galon"] });
    },
    onError: (payload: AxiosError) => {
      toast.error(payload.response?.statusText as string);
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
          <DialogTitle>Edit Transaksi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaPembeli"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pelanggan</FormLabel>
                  <FormControl>
                    <Input placeholder="siswanto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kuantitas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kuantitas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={meta.data.jenisTransaksiId === 3}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {meta.data.jenisTransaksiId !== 1 && (
                    <FormDescription>Sisa galon = {galon}</FormDescription>
                  )}
                  {meta.data.jenisTransaksiId === 3 && (
                    <FormDescription>
                      Kuantitas pinjam tidak bisa diedit
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jenisTransaksiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <Select
                    disabled
                    value={field.value.toString()}
                    onValueChange={(e) => field.onChange(Number(e))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="jenis transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data &&
                        data.map((jenis) => (
                          <SelectItem
                            key={jenis.id}
                            value={jenis.id.toString()}
                          >
                            {jenis.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Untuk mengedit transaksi harus menghapus terlebih dahulu
                    transaksi ini
                  </FormDescription>
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
