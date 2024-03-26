import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prismaInstance } from "~/lib/prisma";
import { Transaksi } from "~/schema";
export async function DELETE(
  req: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
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

    //tambah galon
    await prismaInstance.galonTersisa.update({
      where: {
        id: 1,
      },
      data: {
        jumlah: {
          increment: trans.kuantitas,
        },
      },
    });

    const result = await prismaInstance.transaksi.delete({
      where: {
        kode: params.kode,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "[DELETE_TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { kode: string } }
) {
  try {
    const payload: Transaksi = await req.json();
    const { jenisTransaksiId, kuantitas, namaPembeli, tanggal } = payload;

    if (!namaPembeli || !kuantitas || !tanggal || !jenisTransaksiId) {
      console.log(payload);
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
    const jenisTransaksi = await prismaInstance.jenisTranksasi.findUnique({
      where: {
        id: jenisTransaksiId,
      },
    });
    if (!jenisTransaksi) {
      return NextResponse.json(
        { message: "Jenis Transaksi tidak ditemukan" },
        { status: 400 }
      );
    }

    const sisaGalon = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });

    const selisihKuantitas = Math.abs(kuantitas - trans.kuantitas);
    const incrementOrDecrement: Prisma.IntFieldUpdateOperationsInput = {
      increment: undefined,
      decrement: undefined,
    };

    if (!sisaGalon) {
      throw Error("Galon tidak ditemukan");
    }

    // jika selisih lebih besar dari sisa galon, maka invalid
    if (selisihKuantitas > sisaGalon.jumlah) {
      return NextResponse.json(
        { message: "Galon tidak cukup" },
        { status: 405 }
      );
    }
    //jika kuantitas baru yang lebih besar dari kuantitas lama, maka galon decrement (kuantitas baru - lama)
    if (kuantitas > trans.kuantitas) {
      incrementOrDecrement.decrement = selisihKuantitas;
      // jika kuantitas baru lebih kecil dari kuantitas lama, maka galon increment (kuantitas baru - lama)
    } else if (kuantitas < trans.kuantitas) {
      incrementOrDecrement.increment = selisihKuantitas;
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

      //update transaksi
      await prismaInstance.transaksi.update({
        where: {
          kode: params.kode,
        },
        data: {
          harga: jenisTransaksi.harga,
          jenisTransaksiId,
          kuantitas,
          namaPembeli,
          tanggal,
        },
      });
    }
    return NextResponse.json(
      { message: "Berhasil di update" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "[PUT_TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}
