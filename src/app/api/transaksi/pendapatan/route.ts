import { NextRequest, NextResponse } from "next/server";
import { prismaInstance } from "~/lib/prisma";
import _ from "lodash";
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const tanggal = params.get("tanggal");
    const tahun = params.get("tahun");

    if (tanggal) {
      const query = {
        tanggal: {
          gte: new Date(tanggal),
          lt: new Date(
            new Date(tanggal).setDate(new Date(tanggal).getDate() + 1)
          ),
        },
      };

      const result = await prismaInstance.transaksi.findMany({
        where: query,
      });

      let totalPendapatan = 0;
      const payload = result.map((item) => {
        const total = item.harga * item.kuantitas;
        totalPendapatan += total;
        return { ...item, total };
      });

      return NextResponse.json({ payload, totalPendapatan });
    } else if (tahun) {
      const query = {
        tanggal: {
          gte: new Date(tahun),
          lt: new Date(
            new Date(tahun).setFullYear(new Date(tahun).getFullYear() + 1)
          ),
        },
      };
      const result = await prismaInstance.transaksi.findMany({
        where: query,
        select: {
          tanggal: true,
          harga: true,
          kuantitas: true,
        },
      });

      const withTotal = result.map((item) => {
        const total = item.harga * item.kuantitas;
        return { ...item, total };
      });

      const groupedByMonth = _.groupBy(withTotal, (transaksi) => {
        const date = new Date(transaksi.tanggal);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      });

      const withMonthlyTotal = _.mapValues(groupedByMonth, (transactions) => {
        const monthlyTotal = _.sumBy(transactions, "total");
        return {
          transactions,
          monthlyTotal,
        };
      });

      const totalPendapatanTahun = _.sumBy(withTotal, "total");

      return NextResponse.json({
        payload: withMonthlyTotal,
        totalPendapatanTahun,
      });
    } else {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "[GET_PENDAPATAN] " + err },
      { status: 500 }
    );
  }
}
