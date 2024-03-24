import { z } from "zod";

export const authSchema = z.object({
  username: z.string().min(2, { message: "Username harus ada" }).max(255),
  password: z
    .string()
    .min(6, { message: "Password minimal 6 karakter" })
    .max(255),
});

export type Auth = z.infer<typeof authSchema>;

export const jenisTransaksiSchema = z.object({
  nama: z.string().min(2, { message: "Nama transaksi harus ada" }),
  harga: z.number().min(2, { message: "Harga jenis diperlukan" }),
});

export type NewJenisTranksasi = z.infer<typeof jenisTransaksiSchema>;
export type JenisTranksasi = NewJenisTranksasi & { id: number };

export const transaksiSchema = z.object({
  namaPembeli: z
    .string()
    .min(2, { message: "Nama pembeli harus ada" })
    .max(255),
  tanggal: z.date({ required_error: "Tanggal transkasi diperlukan" }),
  jenisTransaksiId: z
    .number()
    .min(1, { message: "Jenis transaksi diperlukan" }),
  kuantitas: z.number().min(1, { message: "Kuantitas diperlukan" }),
});

export type NewTransaksi = z.infer<typeof transaksiSchema>;
export type Transaksi = NewTransaksi & {
  kode: string;
  harga: number;
  total: number;
  jenisTransaksi: JenisTranksasi;
};
