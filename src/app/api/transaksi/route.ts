import { Prisma } from "@prisma/client";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { prismaInstance, prismaPaginate } from "~/lib/prisma";
import { NewTransaksi } from "~/schema";
import { plusSevenTime, substractSevenTime } from "~/lib/utils";
import { endOfDay } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const payload: NewTransaksi = await req.json();
    const { jenisTransaksiId, kuantitas, namaPembeli, tanggal } = payload;

    if (!jenisTransaksiId || !kuantitas || !namaPembeli || !tanggal) {
      return NextResponse.json(
        {},
        { status: 400, statusText: "Request tidak valid" }
      );
    }
    const sisaGalon = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });

    if (!sisaGalon) {
      throw Error("Kesalahan database galon");
    }

    const findJenisTransaksi = await prismaInstance.jenisTransaksi.findUnique({
      where: {
        id: jenisTransaksiId,
      },
    });

    if (!findJenisTransaksi) {
      return NextResponse.json(
        {},
        { status: 400, statusText: "Jenis transaksi tidak ditemukan" }
      );
    }

    if (sisaGalon.jumlah <= 0 || kuantitas > sisaGalon.jumlah) {
      return NextResponse.json(
        {},
        { status: 400, statusText: "Galon tidak mencukupi" }
      );
      // return NextResponse.e
    }
    if (jenisTransaksiId !== 1) {
      await prismaInstance.galonTersisa.update({
        where: {
          id: 1,
        },
        data: {
          jumlah: {
            decrement: kuantitas,
          },
        },
      });
    }

    const result = await prismaInstance.transaksi.create({
      data: {
        kuantitas,
        namaPembeli,
        tanggal,
        jenisTransaksiId,
        harga: findJenisTransaksi.harga,
      },
    });

    if (jenisTransaksiId === 3) {
      await prismaInstance.pengembalianGalon.create({
        data: {
          kembali: 0,
          pinjam: result.kuantitas,
          kodeTransaksi: result.kode,
        },
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.log("[POST_TRANSAKSI]" + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const page = parseInt(params.get("page") as string);
    const kodeOrPembeli = params.get("q");
    const from = params.get("from");
    const to = params.get("to");
    const jenis = params.getAll("jenis");
    const jenisNumber = _.map(jenis, Number);
    const whereQuery: Prisma.TransaksiWhereInput = {
      ...(jenisNumber.length > 0 && {
        jenisTransaksiId: {
          in: jenisNumber,
        },
      }),
      ...(from && {
        tanggal: {
          gte: substractSevenTime(new Date(from)),
          lt: plusSevenTime(new Date(to || from)),
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

    const [result, meta] = await prismaPaginate.transaksi
      .paginate({
        where: whereQuery,
        include: {
          jenisTransaksi: true,
        },
        orderBy: {
          tanggal: "desc",
        },
      })
      .withPages({
        limit: 30,
        page: !!page ? page : 1,
        includePageCount: true,
      });
    const payload = result.map((trans) => {
      const total = trans.harga * trans.kuantitas;
      return { ...trans, total };
    });

    const total_kuantitas = _.sumBy(payload, (item) => item.kuantitas);
    const total_pendapatan = _.sumBy(payload, (item) => item.total);

    return NextResponse.json({
      payload,
      total: {
        kuantitas: total_kuantitas,
        pendapatan: total_pendapatan,
      },
      meta: { ...meta },
    });
  } catch (err) {
    console.log("[GET_TRANSAKSII] " + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
