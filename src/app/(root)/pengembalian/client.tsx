"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { useDebounce } from "~/hooks";
import { axiosInstance, formatTanggal } from "~/lib/utils";
import { DataPagination, DataModal } from "../transaksi/client";
import EditPengembalian from "./component/edit-pengembalian";
import PaginationComponent from "~/components/layout/pagination";

export default function Pengembalian() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("q") || "";
  const [tanggal, setTanggal] = useState<Date>();
  const [queryString, setQueryString] = useState("");
  const queryDebounce = useDebounce(query);
  const [status, setStatus] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();
  useEffect(() => {
    if (!!query) {
      setQueryString(query);
    }
  }, [query]);
  const { data, isLoading } = useQuery<DataPagination>({
    queryKey: ["pengembalian", page, queryDebounce, tanggal, status],
    queryFn: async () => {
      return axiosInstance
        .get(
          `/api/pengembalian?page=${
            page ?? 1
          }&q=${query}&status=${status}&tanggal=${tanggal || ""}`
        )
        .then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
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
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Cari Pembeli atau Kode"
          className="w-1/3"
          value={queryString}
          onChange={handleSearchChange}
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
                <TableCell>{trans.kuantitas}</TableCell>
                <TableCell>{trans.galonKembali}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      trans.kuantitas - trans.galonKembali === 0
                        ? "default"
                        : "destructive"
                    }
                    
                  >
                    {trans.kuantitas - trans.galonKembali === 0
                      ? "LUNAS"
                      : "BELUM LUNAS"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-4">
                  <Button
                    variant={"warning"}
                    size={"icon"}
                    onClick={() => {
                      setDataModal({
                        data: trans,
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
        </TableBody>
      </Table>
      <div className="mt-4">
        {data && <PaginationComponent data={data.meta} path={path} />}
      </div>
      <EditPengembalian
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}