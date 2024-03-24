"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

import AddTransaski from "./component/add-transaksi";
import { axiosInstance, formatTanggal, formatRupiah } from "~/lib/utils";
import { Transaksi } from "~/schema";
import { EditDeleteOperation, ModalProps } from "~/types";
import DeleteTransaksi from "./component/delete-transaksi";

export type DataModal = {
  operation: EditDeleteOperation;
  data: Transaksi;
};

export default function Transaksi() {
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();

  

  const { data = [] } = useQuery<Transaksi[]>({
    queryKey: ["transaksi"],
    queryFn: async () => {
      return axiosInstance.get("/api/transaksi").then((data) => data.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <AddTransaski />
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
          {data &&
            data.map((trans) => (
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
            ))}
        </TableBody>
      </Table>
      <DeleteTransaksi
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}
