import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "./schema";

config({ path: ".dev.vars" });

export const configDb = (c: Context) => {
  try {
    const sql = neon(c.env.DATABASE_URL ?? "");
    const db = drizzle(sql, { schema });
    return db;
  } catch (error) {
    console.error("🚀 ~ configDb ~ error:", error);
    throw error;
  }
};
