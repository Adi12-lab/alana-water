import Galon from "~/../public/galon.jpeg";
import Image from "next/image";
import Client from "./client";

export default function Page() {
  return (
    <section className="grid place-content-center h-screen gap-y-5">
      <h1 className="font-bold text-center text-3xl">Jumlah Galon</h1>
      <div className="flex items-center flex-col gap-y-5">
        <Image priority src={Galon} alt="galon" width={400} />
        <Client />
      </div>
    </section>
  );
}
