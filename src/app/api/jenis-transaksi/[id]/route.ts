import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import { JenisTransaksi } from "~/schema";
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await prismaInstance.jenisTransaksi.delete({
      where: {
        id,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "[DELETE_JENIS_TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const payload: JenisTransaksi = await req.json();

    if (!payload.harga || !payload.nama) {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }

    const result = await prismaInstance.jenisTransaksi.update({
      where: {
        id,
      },
      data: {
        harga: payload.harga,
        nama: payload.nama,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "[PUT_JENIS_TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}
