import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import { NewJenisTransaksi } from "~/schema";

export async function POST(req: NextRequest) {
  try {
    const payload: NewJenisTransaksi = await req.json();

    const { harga, nama } = payload;

    if (!nama || !harga) {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }

    const result = await prismaInstance.jenisTranksasi.create({
      data: {
        harga,
        nama,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "[POST_JENIS-TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await prismaInstance.jenisTranksasi.findMany();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "[GET_JENIS-TRANSAKASI] " + error },
      { status: 500 }
    );
  }
}
