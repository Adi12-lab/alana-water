"use client";
import { Users } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
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
import PasswordInput from "~/components/ui/password-input";
import { Button } from "~/components/ui/button";
import { axiosInstance } from "~/lib/utils";

import { Auth, authSchema } from "~/schema";
import { DataModal } from "../client";
import { ModalProps } from "~/types";

export default function EditUser({
  isOpen,
  setIsOpen,
  meta,
}: ModalProps<DataModal>) {
  const queryClient = useQueryClient();
  const form = useForm<Users>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (meta && meta.data) {
      form.setValue("username", meta.data.username);
    }
  }, [meta]);

  const userMutation = useMutation({
    mutationKey: ["add-user"],
    mutationFn: async (payload: Auth) => {
      return axiosInstance.put("/api/user/"+meta.data.username, payload).then((data) => data.data);
    },
    onSuccess: () => {
      toast.success("User berhasil diedit");
      setIsOpen(false);
      form.reset()
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
      open={isOpen && meta.operation === "edit"}
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
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
