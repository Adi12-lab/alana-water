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
    const [result, meta] = await prismaPaginate.transaksi
      .paginate({
        include: {
          jenisTransaksi: true,
        },
      })
      .withPages({
        limit: 3,
        page: !!page ? page : 1,
        includePageCount: true,
      });
    const payload = result.map((trans) => {
      const total = trans.harga * trans.kuantitas;
      return { ...trans, total };
    });

    return NextResponse.json({ ...payload, ...meta });
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: "[GET_TRASAKSASI] " + err,
    });
  }
}