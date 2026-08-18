import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance across the app (avoids exhausting
// the Postgres connection pool when `node --watch` reloads modules).
export const prisma = new PrismaClient();
