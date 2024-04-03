export const revalidate = 0; //route ini berada di dialam route lain, sehingga harus diberi revalidate 0, yang artinya tidak di cache
import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import _ from "lodash";

export async function GET(req: NextRequest) {
  try {
    const result = await prismaInstance.pengembalianGalon.findMany({
      select: {
        pinjam: true,
        kembali: true,
      },
    });
    const jumlah_dipinjam =
      _.sumBy(result, (trans) => trans.pinjam) -
      _.sumBy(result, (trans) => trans.kembali);

    return NextResponse.json(jumlah_dipinjam);
  } catch (err) {
    return NextResponse.json(
      {
        message: "[GET_DIPINJAM] " + err,
      },
      { status: 500 }
    );
  }
}
