import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prismaInstance, prismaPaginate } from "~/lib/prisma";
import { NewTransaksi } from "~/schema";

export async function POST(req: NextRequest) {
  try {
    const payload: NewTransaksi = await req.json();
    const { jenisTransaksiId, kuantitas, namaPembeli, tanggal } = payload;

    if (!jenisTransaksiId || !kuantitas || !namaPembeli || !tanggal) {
      return NextResponse.json(
        { message: "Request tidak valid" },
        { status: 400 }
      );
    }
    const sisaGalon = await prismaInstance.galonTersisa.findUnique({
      where: {
        id: 1,
      },
    });

    if (sisaGalon && sisaGalon.jumlah > 0) {
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

      const findJenisTransaksi = await prismaInstance.jenisTranksasi.findUnique(
        {
          where: {
            id: jenisTransaksiId,
          },
        }
      );

      if (findJenisTransaksi) {
        const result = await prismaInstance.transaksi.create({
          data: {
            kuantitas,
            namaPembeli,
            tanggal,
            jenisTransaksiId,
            harga: findJenisTransaksi.harga,
          },
        });
        return NextResponse.json(result);
      } else {
        throw Error("Jenis transaksi tidak ada");
      }
    } else {
      return NextResponse.json(
        { message: "Sisa galon sudah habis" },
        { status: 409 }
      );
    }
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "[POST_TRASAKSASI] " + err,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const page = parseInt(params.get("page") as string);
    const pembeli = params.get("pembeli");
    const tanggal = params.get("tanggal");

    const whereQuery: Prisma.TransaksiWhereInput = {
      namaPembeli: {
        contains: pembeli || undefined,
        mode: "insensitive",
      },
      AND: {
        tanggal: tanggal
          ? {
              gte: new Date(tanggal),
              lt: new Date(
                new Date(tanggal).setDate(new Date(tanggal).getDate() + 1)
              ),
            }
          : {},
      },
    };

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
        limit: 6,
        page: !!page ? page : 1,
        includePageCount: true,
      });
    const payload = result.map((trans) => {
      const total = trans.harga * trans.kuantitas;
      return { ...trans, total };
    });

    return NextResponse.json({ payload, meta: { ...meta } });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "[GET_TRASAKSASI] " + err,
    });
  }
}
