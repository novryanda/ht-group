import { db } from "~/server/db";

export const companyRepo = {
  findByCode(code: string) {
    return db.company.findUnique({
      where: { code },
    });
  },

  findAll() {
    return db.company.findMany({
      orderBy: { name: "asc" },
    });
  },
};
