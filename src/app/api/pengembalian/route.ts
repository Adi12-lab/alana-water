import { Prisma } from "@prisma/client";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { prismaInstance, prismaPaginate } from "~/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const page = parseInt(params.get("page") as string);
    const kodeOrPembeli = params.get("q");
    const tanggal = params.get("tanggal");
    const status = parseInt(params.get("status") as string); //-1= belum lunas, 1 = lunas
    const whereQuery: Prisma.TransaksiWhereInput = {
      ...(tanggal && {
        tanggal: {
          gte: startOfDay(new Date(tanggal)),
          lt: endOfDay(new Date(tanggal)),
        },
      }),
      jenisTransaksiId: 3,
    };
    // Hanya tambahkan kondisi OR jika kodeOrPembeli ada
    if (kodeOrPembeli) {
      whereQuery.OR = [
        {
          namaPembeli: {
            contains: kodeOrPembeli,
            mode: "insensitive",
          },
        },
        {
          kode: {
            equals: kodeOrPembeli,
          },
        },
      ];
    }

    let payload, meta;
    if (!!status) {
      const result = await prismaInstance.transaksi.findMany({
        where: whereQuery,
        orderBy: {
          tanggal: "desc",
        },
      });

      if (status === 1) {
        payload = result.filter((item) => item.kuantitas === item.galonKembali);
      } else {
        payload = result.filter((item) => item.galonKembali !== item.kuantitas);
      }
    } else {
      [payload, meta] = await prismaPaginate.transaksi
        .paginate({
          where: whereQuery,
          orderBy: {
            tanggal: "desc",
          },
        })
        .withPages({
          limit: 6,
          page: !!page ? page : 1,
          includePageCount: true,
        });
    }

    return NextResponse.json({ payload, meta: { ...meta } });
  } catch (err) {
    console.log("[GET_PENGEMBALIAN]" + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
