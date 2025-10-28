import { db } from "~/server/db";

/**
 * Get PT PKS company ID from database
 * This is a helper function to avoid hardcoding company ID in API routes
 * 
 * @returns Company object with id and name
 * @throws Error if company not found
 */
export async function getPTPKSCompany() {
  const company = await db.company.findFirst({
    where: { name: "PT Perkebunan Sawit" }
  });

  if (!company) {
    throw new Error("PT Perkebunan Sawit company not found in database");
  }

  return company;
}

/**
 * Get company by name
 * 
 * @param name - Company name
 * @returns Company object with id and name
 * @throws Error if company not found
 */
export async function getCompanyByName(name: string) {
  const company = await db.company.findFirst({
    where: { name }
  });

  if (!company) {
    throw new Error(`Company ${name} not found in database`);
  }

  return company;
}

/**
 * Get company by code
 * 
 * @param code - Company code (e.g., "PT-PKS", "PT-NILO")
 * @returns Company object with id and name
 * @throws Error if company not found
 */
export async function getCompanyByCode(code: string) {
  const company = await db.company.findFirst({
    where: { code }
  });

  if (!company) {
    throw new Error(`Company with code ${code} not found in database`);
  }

  return company;
}
