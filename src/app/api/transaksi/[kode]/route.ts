import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
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
