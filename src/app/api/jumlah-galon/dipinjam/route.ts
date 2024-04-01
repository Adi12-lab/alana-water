import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import _ from "lodash";

export async function GET(req: NextRequest) {
  try {
    const result = await prismaInstance.transaksi.findMany({
      where: {
        jenisTransaksiId: 3,
      },
      select: {
        kuantitas: true,
        galonKembali: true,
      },
    });

    const jumlah_dipinjam =
      _.sumBy(result, (trans) => trans.kuantitas) -
      _.sumBy(result, (trans) => trans.galonKembali);

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
