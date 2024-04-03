import { PrismaClient } from "@prisma/client";
import { createPaginator } from "prisma-extension-pagination";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaInstance = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismaInstance = global.prisma;
}

const paginate = createPaginator({
  pages: {
    includePageCount: true,
    limit: 3,
  },
  cursor: {
    limit: 3,
  },
});

const prismaPaginate = prismaInstance.$extends({
  model: {
    transaksi: {
      paginate,
    },
    pengembalianGalon: {
      paginate,
    },
  },
});

export { prismaInstance, prismaPaginate };
