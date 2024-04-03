"use client";
import React, { useState, useEffect, ChangeEvent, Suspense} from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
  RefreshCcw,
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
  DropdownMenuCheckboxItem,
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
import { JenisTransaksi, JumlahGalon, Transaksi as TransaksiType } from "~/schema";
import { EditDeleteOperation, MetaPagination } from "~/types";
import DeleteTransaksi from "./component/delete-transaksi";
import EditTransaksi from "./component/edit-transaksi";

export type DataModal = {
  operation: EditDeleteOperation;
  data: TransaksiType;
};

export type DataPagination = {
  payload: TransaksiType[];
  meta: MetaPagination;
};

export default function Transaksi() {
  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("q") || "";

  const [queryString, setQueryString] = useState("");
  const queryDebounce = useDebounce(query, 500);
  const [tanggal, setTanggal] = useState<Date>();
  const [filterJenis, setFilterJenis] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();

  useEffect(() => {
    if (!!query) {
      setQueryString(query);
    }
  }, [query]);

  const { data, isLoading } = useQuery<DataPagination>({
    queryKey: ["transaksi", page, queryDebounce, tanggal, filterJenis],
    queryFn: async () => {
      let filterStringJenis = "";
      filterJenis.forEach((val) => {
        filterStringJenis += `&jenis=${val}`;
      });
      return axiosInstance
        .get(
          `/api/transaksi?page=${page ?? 1}&q=${query}&tanggal=${
            tanggal || ""
          }${filterStringJenis}`
        )
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const sisaGalon = useQuery<JumlahGalon>({
    queryKey: ["jumlah-galon"],
    queryFn: async () => {
      return axiosInstance.get("/api/jumlah-galon").then((data) => data.data);
    },
    staleTime: Infinity,
  });

  const jenisTransaksi = useQuery<JenisTransaksi[]>({
    queryKey: ["jenis-transaksi"],
    queryFn: async () => {
      return axiosInstance
        .get("/api/jenis-transaksi")
        .then((data) => data.data);
    },
    staleTime: Infinity,
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQueryString(value);
    const params = new URLSearchParams();
    params.set("q", value);
    const queryString = params.toString();
    const updatedPath = queryString ? `${path}?${queryString}` : path;
    router.replace(updatedPath);
  };

  return (
    <>
      <h1 className="font-bold text-2xl">Transaksi</h1>
      <div className="mb-4 mt-6">
        <AddTransaski galon={sisaGalon.data?.jumlah as number} />
      </div>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Cari Pembeli atau Kode"
          className="w-1/3"
          value={queryString}
          onChange={handleSearchChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={filterJenis.length > 0 ? "success" : "outline"}>
              Jenis Transaksi
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {jenisTransaksi.data &&
              jenisTransaksi.data.map((jns) => (
                <DropdownMenuCheckboxItem
                  key={jns.id}
                  checked={filterJenis.indexOf(jns.id) !== -1}
                  onCheckedChange={() => {
                    let newFilter: number[];
                    if (filterJenis.includes(jns.id)) {
                      // Jika id sudah ada dalam array, kita ingin menghapusnya
                      newFilter = filterJenis.filter((n) => n !== jns.id);
                    } else {
                      // Jika id belum ada dalam array, tambahkan
                      newFilter = [...filterJenis, jns.id];
                    }
                    setFilterJenis(newFilter);
                  }}
                >
                  {jns.nama}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
                      {trans.jenisTransaksiId === 3 && (
                        <DropdownMenuItem className="flex items-center gap-x-3">
                          <RefreshCcw size={16} color="blue" />
                          <a href={`/pengembalian?q=${trans.kode}`}>
                            Pengembalian
                          </a>
                        </DropdownMenuItem>
                      )}
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
