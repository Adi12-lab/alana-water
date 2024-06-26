"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Loader2 } from "lucide-react";

import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { axiosInstance, formatRupiah } from "~/lib/utils";

export default function HariIni() {
  const [dateNow, setDateNow] = useState("");

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setDateNow(`${year}-${month}-${day}`);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["pendapatan", dateNow],
    queryFn: async () => {
      return axiosInstance
        .get(`/api/transaksi/pendapatan?tanggal=${dateNow}`)
        .then((data) => data.data);
    },
    enabled: !!dateNow,
  });
  return (
    <Card className="shadow-md rounded-2xl p-5">
      <div className="flex justify-between">
        <CardTitle className="text-sm font-normal">
          Pendapatan {dateNow}
        </CardTitle>
        <DollarSign />
      </div>
      <CardContent className="p-0">
        <h3 className="font-bold text-3xl">
          {!isLoading && data ? (
            formatRupiah(data.totalPendapatan)
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </h3>
      </CardContent>
    </Card>
  );
}
