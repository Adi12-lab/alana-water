"use client";
import { ChangeEvent, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import {
  Pencil,
  Calendar as CalendarIcon,
  Loader2,
  Folder,
} from "lucide-react";

import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import { Anchor } from "~/components/ui/anchor";
import { Input } from "~/components/ui/input";
import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { axiosInstance, formatTanggal } from "~/lib/utils";
import EditPengembalian from "./component/edit-pengembalian";
import PaginationComponent from "~/components/layout/pagination";
import {
  PengembalianGalon as PengembalianGalonType,
  Transaksi,
} from "~/schema";
import { MetaPagination } from "~/types";
import { useDebouncedCallback } from "use-debounce";

export type TransaksiAndPengembalian = Transaksi & {
  pengembalianGalon: PengembalianGalonType;
};

export type DataModal = {
  operation: "edit";
  data: PengembalianGalonType;
};

export type DataPagination = {
  payload: TransaksiAndPengembalian[];
  total: {
    pinjam: number;
    kembali: number;
  };
  meta: MetaPagination;
};

export default function PengembalianGalon() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("q") || "";
  const [date, setDate] = useState<DateRange>();
  const [status, setStatus] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();

  const { data, isLoading } = useQuery<DataPagination>({
    queryKey: ["pengembalian", page, query, date, status],
    queryFn: async () => {
      return axiosInstance
        .get(
          `/api/pengembalian?page=${
            page ?? 1
          }&q=${query}&status=${status}&from=${date?.from || ""}&to=${
            date?.to || ""
          }`
        )
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleSearchChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const params = new URLSearchParams();
      params.set("q", value);
      const queryString = params.toString();
      const updatedPath = queryString ? `${path}?${queryString}` : path;
      router.replace(updatedPath);
    },
    300
  );

  return (
    <>
      <h1 className="font-bold text-2xl">Pengembalian</h1>
      <div className="flex justify-between mb-4 mt-6">
        <Input
          placeholder="Cari Pembeli atau Kode"
          className="w-1/3"
          onChange={handleSearchChange}
          defaultValue={query}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {status === 1
                ? "LUNAS"
                : status === -1
                ? "BELUM LUNAS"
                : "Jenis Transaksi"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={status === 1}
              onCheckedChange={() =>
                status === 1 ? setStatus(0) : setStatus(1)
              }
            >
              LUNAS
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={status === -1}
              onCheckedChange={() =>
                status === -1 ? setStatus(0) : setStatus(-1)
              }
            >
              BELUM LUNAS
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Cari tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Peminjam</TableHead>
            <TableHead>Jumlah Pinjam</TableHead>
            <TableHead>Jumlah Kembali</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && !data ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex items-center justify-center gap-x-3">
                  <Loader2 className="animate-spin" />
                  <span>Mengambil data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data?.payload.map((trans) => (
              <TableRow key={trans.kode}>
                <TableCell>{formatTanggal(new Date(trans.tanggal))}</TableCell>
                <TableCell>{trans.namaPembeli}</TableCell>
                <TableCell>{trans.pengembalianGalon.pinjam}</TableCell>
                <TableCell>{trans.pengembalianGalon.kembali}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      trans.pengembalianGalon.isLunas
                        ? "default"
                        : "destructive"
                    }
                  >
                    {trans.pengembalianGalon.isLunas ? "LUNAS" : "BELUM LUNAS"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-4">
                  <Button
                    variant={"warning"}
                    size={"icon"}
                    onClick={() => {
                      setDataModal({
                        data: trans.pengembalianGalon,
                        operation: "edit",
                      });
                      setOpenModal(true);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Anchor
                    href={`/transaksi/?q=${trans.kode}`}
                    variant={"secondary"}
                    size={"icon"}
                  >
                    <Folder />
                  </Anchor>
                </TableCell>
              </TableRow>
            ))
          )}
          <TableRow className="font-bold">
            <TableCell colSpan={2} className="text-center">
              Total
            </TableCell>
            <TableCell>{data?.total.pinjam}</TableCell>
            <TableCell>{data?.total.kembali}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-4">
        {data && (
          <PaginationComponent data={data.meta} path={path} query={query} />
        )}
      </div>
      <EditPengembalian
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}
