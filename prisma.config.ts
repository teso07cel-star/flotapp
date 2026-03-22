import "dotenv/config";
import { defineConfig } from "prisma/config";

const baseUrls = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let databaseUrl = baseUrls;

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
