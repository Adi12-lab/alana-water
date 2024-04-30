export const dynamic = "force-dynamic";

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
    const from = params.get("from");
    const to = params.get("to");
    const status = parseInt(params.get("status") as string); //-1= belum lunas, 1 = lunas
    const whereQuery: Prisma.TransaksiWhereInput = {
      ...(from && {
        tanggal: {
          gte: startOfDay(new Date(from)),
          lt: endOfDay(new Date(to || from)),
        },
      }),
      jenisTransaksiId: 3,
      ...(status && {
        pengembalianGalon: {
          isLunas: status === 1,
        },
      }),
    };
    // Hanya tambahkan kondisi OR jika kodeOrPembeli ada
    if (kodeOrPembeli) {
      whereQuery.OR = [
        {
          namaPembeli: {
            contains: kodeOrPembeli,
          },
        },
        {
          kode: {
            equals: kodeOrPembeli,
          },
        },
      ];
    }

    const [payload, meta] = await prismaPaginate.transaksi
      .paginate({
        where: whereQuery,
        orderBy: {
          tanggal: "desc",
        },
        include: {
          pengembalianGalon: true,
        },
      })
      .withPages({
        limit: 30,
        page: !!page ? page : 1,
        includePageCount: true,
      });

    const totalPinjamKembali = [];
    if (kodeOrPembeli) {
      totalPinjamKembali.push(
        `(transaksi."nama_pembeli" ILIKE '%${kodeOrPembeli}%' OR transaksi.kode ILIKE '%${kodeOrPembeli}%')`
      );
    }

    if (from) {
      totalPinjamKembali.push(
        `transaksi.tanggal BETWEEN '${from}' AND '${to || from}'`
      );
    }
    const totalPinjam = _.sumBy(payload, (item) => {
      if (item.pengembalianGalon) return item.pengembalianGalon.pinjam;
      return 0;
    });
    const totalKembali = _.sumBy(payload, (item) => {
      if (item.pengembalianGalon) return item.pengembalianGalon.kembali;
      return 0;
    });
    // const pinjamAndKembali: { total_pinjam: number; total_kembali: number } =
    //   await prismaInstance.$queryRawUnsafe(`SELECT
    //   CAST(SUM(pengembalian.pinjam) AS INTEGER) AS pinjam,
    //   CAST(SUM(pengembalian.kembali) AS INTEGER) AS kembali
    // FROM
    //   public."Transaksi" AS transaksi
    //   INNER JOIN public."PengembalianGalon" AS pengembalian ON transaksi.kode = pengembalian."kodeTransaksi" ${
    //     totalPinjamKembali.length > 0
    //       ? "WHERE " + totalPinjamKembali.join("AND")
    //       : ""
    //   }`);

    return NextResponse.json({
      payload,
      total: {
        pinjam: totalPinjam,
        kembali: totalKembali,
      },
      meta: { ...meta },
    });
  } catch (err) {
    console.log("[GET_PENGEMBALIAN]" + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
