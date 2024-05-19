// {
//   "out": "drizzle/migrations",
//   "schema": "src/db/schema.ts"
// }

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "src/db/schema.ts",
  migrations: {
    table: "drizzle_migrations", // Nama tabel migrations
    schema: "drizzle/migrations", // Lokasi file migrations
  },
});
