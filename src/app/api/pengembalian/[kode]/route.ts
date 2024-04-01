import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaInstance } from "~/lib/prisma";
import { Transaksi } from "~/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
    const payload: Transaksi = await req.json();
    const { galonKembali } = payload;

    if (!galonKembali) {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }

    const trans = await prismaInstance.transaksi.findUnique({
      where: {
        kode: params.kode,
      },
    });

    if (!trans) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 400 }
      );
    }

    const sisaGalon = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });

    const selisihGalonKembali = Math.abs(galonKembali - trans.galonKembali);
    const incrementOrDecrement: Prisma.IntFieldUpdateOperationsInput = {
      increment: undefined,
      decrement: undefined,
    };

    if (!sisaGalon) {
      throw Error("Galon tidak ditemukan");
    }

    // jika selisih lebih besar dari sisa galon, maka invalid
    if (selisihGalonKembali > trans.kuantitas || selisihGalonKembali < 0) {
      return NextResponse.json(
        { message: "Galon kembali tidak valid" },
        { status: 405 }
      );
    }
    //jika galonKembali baru yang lebih besar dari galonKembali lama, maka galon increment (galonKembali baru - lama)
    if (galonKembali > trans.galonKembali) {
      incrementOrDecrement.increment = selisihGalonKembali;
      // jika galonKembali baru lebih kecil dari galonKembali lama, maka galon increment (galonKembali baru - lama)
    } else if (galonKembali < trans.galonKembali) {
      incrementOrDecrement.decrement = selisihGalonKembali;
    }

    if (!!incrementOrDecrement.increment || !!incrementOrDecrement.decrement) {
      await prismaInstance.galonTersisa.update({
        where: {
          id: 1,
        },
        data: {
          jumlah: incrementOrDecrement,
        },
      });
    }
    //update transaksi
    await prismaInstance.transaksi.update({
      where: {
        kode: params.kode,
      },
      data: {
        galonKembali,
      },
    });
    return NextResponse.json(
      { message: "Berhasil di update" },
      { status: 200 }
    );
  } catch (error) {
    console.log("[PUT_PENGEMBALIAN] " + error )
    return NextResponse.json(
      { },
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
