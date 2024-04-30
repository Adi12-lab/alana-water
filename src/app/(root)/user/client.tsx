"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { axiosInstance } from "~/lib/utils";
import { Users } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import AddUser from "./components/add-user";
type UserSafe = Pick<Users, "username">;

import { EditDeleteOperation } from "~/types";
import EditUser from "./components/edit-user";
import DeleteUser from "./components/delete-user";

export type DataModal = {
  operation: EditDeleteOperation;
  data: UserSafe;
};

function User() {
  const [openModal, setOpenModal] = useState(false);
  const [dataModal, setDataModal] = useState<DataModal>();
  const { data, isLoading } = useQuery<UserSafe[]>({
    queryKey: ["user"],
    queryFn: async () => {
      return axiosInstance.get("/api/user").then((data) => data.data);
    },
  });
  return (
    <>
      <div className="flex justify-between">
        <h1 className="font-bold text-xl">User Admin</h1>
        <AddUser />
      </div>
      <div className="w-full max-w-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !data ? (
              <TableRow>
                <TableCell>
                  <div className="flex items-center justify-center gap-x-3">
                    <Loader2 className="animate-spin" />
                    <span>Mengambil data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data &&
              data.map((user) => (
                <TableRow key={user.username}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="space-x-3">
                    <Button
                      className="p-2 space-x-2 w-fit"
                      variant={"warning"}
                      size={"icon"}
                      onClick={() => {
                        setOpenModal(true);
                        setDataModal({
                          data: user,
                          operation: "edit",
                        });
                      }}
                    >
                      <span>Edit</span>
                      <Pencil />
                    </Button>
                    <Button
                      className="p-2 space-x-2 w-fit"
                      variant={"destructive"}
                      size={"icon"}
                      onClick={() => {
                        setOpenModal(true);
                        setDataModal({
                          data: user,
                          operation: "delete",
                        });
                      }}
                    >
                      <span>Hapus</span>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditUser
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />

      <DeleteUser
        isOpen={openModal}
        setIsOpen={setOpenModal}
        meta={dataModal as DataModal}
      />
    </>
  );
}

export default User;
