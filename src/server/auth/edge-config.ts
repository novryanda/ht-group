/**
 * Edge-compatible auth config for middleware
 * This file MUST NOT import Prisma, bcrypt, or any Node.js-only modules
 * to keep Edge Function bundle size small
 */
import { type NextAuthConfig } from "next-auth";
import { baseAuthConfig } from "./base-config";

export const edgeAuthConfig: NextAuthConfig = {
  ...baseAuthConfig,
  // Empty providers array - actual auth is handled by main config
  providers: [],
};

