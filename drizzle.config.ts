import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/db/schema.ts",
  migrations: {
    table: "drizzle_migrations", // Nama tabel migrations
    schema: "drizzle/src/migrations", // Lokasi file migrations
  },
});
