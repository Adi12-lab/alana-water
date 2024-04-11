"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { bulanIndonesia } from "~/constant";
import { axiosInstance, formatRupiah } from "~/lib/utils";
import { Loader2 } from "lucide-react";

export default function Chart() {
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["pendapatan", year],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/transaksi/pendapatan?tahun=${year}`
      );
      const result = response.data;
      const formatMonth = _.map(bulanIndonesia, (month, index) => ({
        month,
        monthlyTotal: _.get(result, `payload.${index + 1}.monthlyTotal`),
      }));

      return {
        months: formatMonth,
        totalPendapatanTahun: result.totalPendapatanTahun,
      };
    },
    enabled: !!year,
  });
  return (
    data && (
      <>
        <div className="flex items-center justify-between">
          <p className="text-green-600 font-semibold">
            Total Pendapatan : {formatRupiah(data.totalPendapatanTahun)}
          </p>
          <div className="w-[200px]">
            <Select onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder={year} defaultValue={year} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                <SelectItem value="2029">2029</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
                <SelectItem value="2031">2031</SelectItem>
                <SelectItem value="2032">2032</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          {isLoading ? (
            <div className="flex space-x-4">
              <Loader2 className="animate-spin" />
              <span>Merekap penghasilan...</span>
            </div>
          ) : (
            <BarChart
              width={1200}
              height={300}
              data={data?.months}
              margin={{
                top: 30,
                right: 30,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis
                dataKey="monthlyTotal"
                tickFormatter={(value) => formatRupiah(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="monthlyTotal"
                fill="#8884d8"
                width={20}
                activeBar={<Rectangle fill="pink" stroke="blue" />}
              />
            </BarChart>
          )}
        </div>
      </>
    )
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Record<string, number>[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="border border-purple-500 p-3 bg-white opacity-80"
      >
        <p className="font-bold">{label}</p>
        <p className="text-green-500">{formatRupiah(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};
