import { NextRequest, NextResponse } from "next/server";
import { PengembalianGalon, Prisma } from "@prisma/client";
import { prismaInstance } from "~/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload: PengembalianGalon = await req.json();
    const { kembali } = payload;

    if (typeof kembali !== 'number') {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }

    const pengembalian = await prismaInstance.pengembalianGalon.findUnique({
      where: {
        id: Number(params.id),
      },
    });

    if (!pengembalian) {
      return NextResponse.json(
        { message: "Pengembalian tidak ditemukan" },
        { status: 400 }
      );
    }

    const sisaGalon = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });

    const selisihGalonKembali = Math.abs(kembali - pengembalian.kembali);
    const incrementOrDecrement: Prisma.IntFieldUpdateOperationsInput = {
      increment: undefined,
      decrement: undefined,
    };

    if (!sisaGalon) {
      throw Error("Galon tidak ditemukan");
    }

    // jika selisih lebih besar dari sisa galon, maka invalid
    if (selisihGalonKembali > pengembalian.pinjam || selisihGalonKembali < 0) {
      return NextResponse.json(
        { message: "Galon kembali tidak valid" },
        { status: 405 }
      );
    }
    //jika galonKembali baru yang lebih besar dari galonKembali lama, maka galon increment (galonKembali baru - lama)
    if (kembali > pengembalian.kembali) {
      incrementOrDecrement.increment = selisihGalonKembali;
      // jika galonKembali baru lebih kecil dari galonKembali lama, maka galon increment (galonKembali baru - lama)
    } else if (kembali < pengembalian.kembali) {
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

    await prismaInstance.pengembalianGalon.update({
      where: {
        id: Number(params.id),
      },
      data: {
        kembali,
        isLunas: pengembalian.pinjam === kembali,
      },
    });
    return NextResponse.json(
      { message: "Berhasil di update" },
      { status: 200 }
    );
  } catch (error) {
    console.log("[PUT_PENGEMBALIAN] " + error);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
