import "dotenv/config";
import { defineConfig } from "prisma/config";

const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
// URL verificada con datos
const PRIMARY_URL = "postgres://564f7b4126c00bda79772f4de39727a0743bbd1ded5852d4a307c4fa05ef6ffe:sk_djQevXjD3KsSIKiD828jQ@db.prisma.io:5432/postgres?sslmode=require&connect_timeout=300";

const databaseUrl = envUrl && !envUrl.includes("supabase.co") ? envUrl : PRIMARY_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
