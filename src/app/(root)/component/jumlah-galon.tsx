"use client";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Loader2, Milk } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";

export default function JumlahGalon() {
  const { data, isLoading } = useQuery({
    queryKey: ["jumlah-galon"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon").then((data) => data.data);
    },
  });
  return (
    <Card className="shadow-md rounded-2xl w-[300px] p-5">
      <div className="flex justify-between">
        <CardTitle className="text-sm font-normal">Ketersediaan Galon</CardTitle>
        <Milk />
      </div>
      <CardContent className="p-0">
        <h3 className="font-bold text-3xl">
          {
            isLoading && !data ? (<Loader2 className="animate-spin" />) : data.jumlah
          }
        </h3>
      </CardContent>
    </Card>
  );
}
