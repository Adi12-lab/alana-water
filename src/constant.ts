export const bulanIndonesia = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const routes = {
  protected: ["/", "/jenis-transaksi", "/jumlah-galon", "/transaksi", "/user"],
  unprotected: ["/login"],
};

export const zone = process.env.TIME_ZONE as string;