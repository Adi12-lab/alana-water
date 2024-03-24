"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { JumlahGalon, jumlahGalonSchema } from "~/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";

export default function Client() {
  const { data } = useQuery<JumlahGalon>({
    queryKey: ["jumlah-galon"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon").then((data) => data.data);
    },
  });

  const jumlahGalonMutation = useMutation({
    mutationKey: ["jumlah-galon-mutation"],
    mutationFn: async (payload: JumlahGalon) => {
      return axiosInstance
        .put("/api/jumlah-galon", payload)
        .then((data) => data.data);
    },
    onSuccess: ()=> {
        toast.success("Jumlah galon berhasil di update")
    },
    onError: ()=> {
        toast.error("Jumlah galon gagal diupdate")
    }
  });

  const form = useForm<JumlahGalon>({
    resolver: zodResolver(jumlahGalonSchema),
    defaultValues: {
      jumlah: 0,
    },
  });

  useEffect(() => {
    if (data) {
      form.setValue("jumlah", data.jumlah);
    }
  }, [data, form]);

  
  function onSubmit(values: JumlahGalon) {
    jumlahGalonMutation.mutate(values);
  }

  return data && (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-3">
          <FormField
            control={form.control}
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center font-bold text-lg w-fit"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mx-auto">
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}
