"use client";
import { Suspense } from "react";
import Pengembalian from "./client";

export default function Page() {
  return (
    <Suspense>
      <Pengembalian />
    </Suspense>
  );
}
