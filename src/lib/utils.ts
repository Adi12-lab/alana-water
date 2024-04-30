import { type ClassValue, clsx } from "clsx";
import moment from "moment-timezone";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rgbToHex(rgb: string): string {
  // Memisahkan string RGB menjadi array
  let splitedRgb = rgb.split(",").map(Number);

  // Fungsi untuk mengubah satu nilai RGB menjadi Hex
  let toHex = (rgbValue: number): string => {
    let hex = rgbValue.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  // Mengubah setiap nilai RGB menjadi Hex dan menggabungkannya
  let hexColor =
    "#" + toHex(splitedRgb[0]) + toHex(splitedRgb[1]) + toHex(splitedRgb[2]);

  return hexColor;
}

export function formatTanggal(date: Date) {
  const f = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
  });
  return f.format(date);
}

export function formatRupiah(angka: number) {
  const reverse = angka.toString().split("").reverse().join("");
  const ribuan = reverse.match(/\d{1,3}/g);
  const formatted = ribuan?.join(".").split("").reverse().join("");
  return "Rp " + formatted;
}

export function substractSevenTime(date: Date) {
  return moment(date).subtract(7, "hours").toISOString();
}
export function plusSevenTime(date: Date) {
  return moment(date).add(7, "hours").toISOString();
}

import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: process.env.DOMAIN_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
