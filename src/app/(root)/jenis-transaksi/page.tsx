"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { axiosInstance, formatRupiah } from "~/lib/utils";
import { JenisTransaksi } from "~/schema";
import { Calculator } from "lucide-react";
import EditJenis from "./component/edit-jenis";
import { EditDeleteOperation } from "~/types";

export type DataModal = {
  operation: EditDeleteOperation;
  data: JenisTransaksi;
};

export default function Page() {
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>({
    data: {
      harga: 0,
      nama: "",
      id: 0,
    },
    operation: "delete",
  });
  const { data = [] } = useQuery<JenisTransaksi[]>({
    queryKey: ["jenis-transaksi"],
    queryFn: async () => {
      return axiosInstance
        .get("/api/jenis-transaksi")
        .then((data) => data.data);
    },
  });
  return (
    <>
      <h1 className="font-bold text-xl">Jenis Transaksi</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(data) &&
            data.map((jns) => (
              <TableRow key={jns.id}>
                <TableCell>{jns.nama}</TableCell>
                <TableCell>{formatRupiah(jns.harga)}</TableCell>
                <TableCell className="space-x-4">
                  <Button
                    variant={"warning"}
                    size={"icon"}
                    onClick={() => {
                      setDataModal({
                        data: jns,
                        operation: "edit",
                      });
                      setOpenModal(true);
                    }}
                  >
                    <Calculator />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <EditJenis
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}
