import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".dev.vars" });

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  schema: "src/db/schema.ts",
  migrations: {
    table: "drizzle_migrations", // Nama tabel migrations
    schema: "drizzle/src/migrations", // Lokasi file migrations
  },
});
