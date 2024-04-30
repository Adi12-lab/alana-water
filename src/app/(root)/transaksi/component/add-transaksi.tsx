"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AxiosError, AxiosResponse } from "axios";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { transaksiSchema, NewTransaksi } from "~/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { JenisTransaksi } from "@prisma/client";

export default function AddTransaski({ galon }: { galon: number }) {
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
      queryClient.invalidateQueries({ queryKey: ["pengembalian"] });
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
      open={openModal}
      onOpenChange={() => {
        setOpenModal((isOpen) => !isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={"outline"}>Tambah Transaksi</Button>
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
                      {...field}
                      onChange={(e) => {
                        const kuantitas = Number(e.target.value);
                        if (kuantitas >= 0) {
                          return field.onChange(kuantitas);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Sisa galon = {galon}</FormDescription>
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
                    onValueChange={(e) => {
                      field.onChange(Number(e));
                    }}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "LLL dd, y")
                          ) : (
                            <span>Tanggal transaksi</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
