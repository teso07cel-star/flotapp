import "dotenv/config";
import { defineConfig } from "prisma/config";

const baseUrls = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// URL de emergencia si Vercel no tiene las variables configuradas
const FALLBACK_URL = "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require";

let databaseUrl = baseUrls || FALLBACK_URL;

// Add connect_timeout if it's missing to avoid P1001 in CI/CD environments
if (databaseUrl && !databaseUrl.includes("connect_timeout")) {
  databaseUrl += (databaseUrl.includes("?") ? "&" : "?") + "connect_timeout=300";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
