/**
 * Edge-compatible auth instance for middleware
 * Separate from main auth to avoid bundling Prisma and bcrypt
 */
import NextAuth from "next-auth";
import { edgeAuthConfig } from "./edge-config";

export const { auth: edgeAuth } = NextAuth(edgeAuthConfig);
