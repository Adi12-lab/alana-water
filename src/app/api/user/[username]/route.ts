import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Auth } from "~/schema";
import { prismaInstance } from "~/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const payload: Auth = await req.json();
    const { username, password } = payload;
    const user = await prismaInstance.users.findUnique({
      where: {
        username: params.username,
      },
    });

    if (!user) {
      return NextResponse.json(
        {},
        { status: 400, statusText: "User tidak ditemukan" }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prismaInstance.users.update({
      where: {
        username: params.username,
      },
      data: {
        username,
        password: hashPassword,
      },
    });

    return NextResponse.json({ status: 200, payload: { ...updatedUser } });
  } catch (err) {
    console.log("[DELETE_TRANSAKSI]" + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const deletedUser = await prismaInstance.users.delete({
      where: {
        username: params.username,
      },
    });
    return NextResponse.json({ status: 200, payload: { ...deletedUser } });
  } catch (err) {
    console.log("[DELETE_TRANSAKSI]" + err);
    return NextResponse.json(
      {},
      { status: 500, statusText: "Terjadi kesalahan" }
    );
  }
}
