"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { transaksiSchema, NewTransaksi } from "~/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { JenisTranksasi } from "@prisma/client";

export default function AddTransaski() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewTransaksi>({
    resolver: zodResolver(transaksiSchema),
    defaultValues: {
      jenisTransaksiId: 0,
      kuantitas: 0,
      namaPembeli: "",
      tanggal: new Date(),
    },
  });

  const { data = [] } = useQuery<JenisTranksasi[]>({
    queryKey: ["jenis-transaksi"],
    queryFn: async () => {
      return axiosInstance
        .get("/api/jenis-transaksi")
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const transaksiMutation = useMutation({
    mutationKey: ["add-transaksi"],
    mutationFn: async (payload: NewTransaksi) => {
      return axiosInstance
        .post("/api/transaksi", payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("Transaksi berhasil ditambahkan");
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
    },
    onError: () => {
      toast.error("Transaksi gagal ditambahkan");
    },
  });

  function onSubmit(values: NewTransaksi) {
    transaksiMutation.mutate(values);
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button variant={"outline"} onClick={() => setOpenModal(true)}>
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaPembeli"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pembeli</FormLabel>
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
                  <FormLabel>Jumlah beli</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const kuantitas = Number(e.target.value);
                        if (kuantitas >= 0) {
                          return field.onChange(kuantitas);
                        }
                      }}
                    />
                  </FormControl>
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
                  <Select onValueChange={(e) => field.onChange(Number(e))}>
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
