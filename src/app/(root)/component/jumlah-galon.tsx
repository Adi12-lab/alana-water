"use client";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Milk } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/utils";
import { JumlahGalon } from "~/schema";

export default function JumlahGalon() {
  const { data } = useQuery<JumlahGalon>({
    queryKey: ["jumlah-galon"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon").then((data) => data.data);
    },
  });
  return data && (
    <Card className="shadow-md rounded-2xl w-[300px] p-5">
      <div className="flex justify-between">
        <CardTitle className="text-sm font-normal">Jumlah Galon</CardTitle>
        <Milk />
      </div>
      <CardContent className="p-0">
        <h3 className="font-bold text-3xl">
          {data.jumlah}
        </h3>
      </CardContent>
    </Card>
  );
}
