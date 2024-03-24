"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";

import { Auth, authSchema } from "~/schema";
import { axiosInstance } from "~/lib/utils";
function Login() {
  const router = useRouter();
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: Auth) => {
      return axiosInstance.post("/auth/login", payload).then((data) => data.data);
    },
    onSuccess: (data) => {
      router.push("dashboard");
    },
    onError: () => {
      toast.error("username / password salah");
    },
  });
  function onSubmit(values: z.infer<typeof authSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <section className="container mt-7 flex max-w-full justify-center items-center h-screen">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sebelum mengakses Sistem Informasi Kasir harap login terlebih dahulu
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        disabled={loginMutation.isPending}
                      />
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
                      <PasswordInput
                        placeholder="********"
                        {...field}
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
}

export default Login;
