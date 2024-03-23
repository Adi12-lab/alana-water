import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: process.env.DOMAIN_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});