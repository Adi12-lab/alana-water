"use client";
import { Suspense } from "react";
import Transaksi from "./client";
export default function Page() {
  return (
    <Suspense>
      <Transaksi />
    </Suspense>
  );
}
