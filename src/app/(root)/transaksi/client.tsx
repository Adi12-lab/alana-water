"use client";
import { useState, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { useDebounce } from "~/hooks";
import { cn } from "~/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import PaginationComponent from "~/components/layout/pagination";
import { Input } from "~/components/ui/input";

import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import AddTransaski from "./component/add-transaksi";
import { axiosInstance, formatTanggal, formatRupiah } from "~/lib/utils";
import { JumlahGalon, Transaksi } from "~/schema";
import { EditDeleteOperation, MetaPagination } from "~/types";
import DeleteTransaksi from "./component/delete-transaksi";
import EditTransaksi from "./component/edit-transaksi";

export type DataModal = {
  operation: EditDeleteOperation;
  data: Transaksi;
};

export type DataPagination = {
  payload: Transaksi[];
  meta: MetaPagination;
};

export default function Transaksi() {
  const searchParams = useSearchParams();
  const path = usePathname();
  const page = searchParams.get("page") || "1";

  const [tanggal, setTanggal] = useState<Date>();
  const [pembeli, setPembeli] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();
  const pembeliDebounce = useDebounce(pembeli, 500);

  const { data, isLoading } = useQuery<DataPagination>({
    queryKey: ["transaksi", page, pembeliDebounce, tanggal],
    queryFn: async () => {
      return axiosInstance
        .get(
          `/api/transaksi?page=${
            page ?? 1
          }&pembeli=${pembeliDebounce}&tanggal=${tanggal || ""}`
        )
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const sisaGalon = useQuery<JumlahGalon>({
    queryKey: ["sisa-galon"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon").then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <div className="mb-4">
        <AddTransaski galon={sisaGalon.data?.jumlah as number} />
      </div>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Cari Pembeli"
          className="w-1/3"
          value={pembeli}
          onChange={(e) => setPembeli(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !tanggal && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tanggal ? tanggal.toLocaleDateString("id-ID") : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={tanggal}
              onSelect={setTanggal}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Pembeli</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Kuantitas</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Total</TableHead>
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
                <TableCell>{trans.jenisTransaksi.nama}</TableCell>
                <TableCell>{trans.kuantitas}</TableCell>
                <TableCell>{formatRupiah(trans.harga)}</TableCell>
                <TableCell>{formatRupiah(trans.total)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-x-3"
                        onClick={() => {
                          setDataModal({
                            data: trans,
                            operation: "edit",
                          });
                          setOpenModal(true);
                        }}
                      >
                        <Pencil size={16} color="yellow" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-x-3"
                        onClick={() => {
                          setDataModal({
                            data: trans,
                            operation: "delete",
                          });
                          setOpenModal(true);
                        }}
                      >
                        <Trash2 size={16} color="red" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-4">
        {data && <PaginationComponent data={data.meta} path={path} />}
      </div>

      <EditTransaksi
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
        galon={sisaGalon.data?.jumlah as number} 
      />

      <DeleteTransaksi
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}
