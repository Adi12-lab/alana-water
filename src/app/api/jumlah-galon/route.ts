import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const jumlah: number = await req.json();
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
    return NextResponse.json({
      status: 500,
      message: "[PUT_JUMLAH_GALON] " + err,
    });
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
    return NextResponse.json({
      status: 500,
      message: "[GET_JUMLAH_GALON] " + err,
    });
  }
}
