"use client";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Loader2, Milk } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { JumlahGalon } from "~/schema";

export default function GalonDipinjam() {
  const { data, isLoading } = useQuery({
    queryKey: ["galon-dipinjam"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon/dipinjam").then((data) => data.data);
    },
  });
  return (
    <Card className="shadow-md rounded-2xl p-5">
      <div className="flex justify-between">
        <CardTitle className="text-sm font-normal">Galon Dipinjam</CardTitle>
        <Milk />
      </div>
      <CardContent className="p-0">
        <h3 className="font-bold text-3xl text-red-400">
          {
            isLoading && !data ? (<Loader2 className="animate-spin" />) : data
          }
        </h3>
      </CardContent>
    </Card>
  );
}
