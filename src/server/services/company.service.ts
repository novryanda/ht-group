import { companyRepo } from "~/server/repositories/company.repo";

export const companyService = {
  async getByCode(code: string) {
    if (!code) return null;
    return companyRepo.findByCode(code);
  },

  async listAll() {
    return companyRepo.findAll();
  },
};
