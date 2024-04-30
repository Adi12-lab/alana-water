"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
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
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { Auth, authSchema} from "~/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { Users } from "@prisma/client";
import PasswordInput from "~/components/ui/password-input";

export default function AddUser() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<Users>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const userMutation = useMutation({
    mutationKey: ["add-user"],
    mutationFn: async (payload: Auth) => {
      return axiosInstance
        .post("/api/user", payload)
        .then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("User berhasil ditambahkan");
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (payload: AxiosError) => {
      toast.error(payload.response?.statusText as string);
    },
  });

  function onSubmit(values: Auth) {
    userMutation.mutate(values);
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
        <Button variant={"outline"}>Tambah User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="siswanto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                   <PasswordInput placeholder="*****" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={userMutation.isPending}>
              {userMutation.isPending ? (
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
