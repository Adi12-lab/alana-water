import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import { JumlahGalon } from "~/schema";

export async function PUT(req: NextRequest) {
  try {
    const payload: JumlahGalon = await req.json();
    const { jumlah } = payload;

    const result = await prismaInstance.galonTersisa.update({
      where: {
        id: 1,
      },
      data: {
        jumlah,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        message: "[PUT_JUMLAH_GALON] " + err,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        message: "[GET_JUMLAH_GALON] " + err,
      },
      { status: 500 }
    );
  }
}
