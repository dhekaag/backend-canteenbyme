import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const canteens = sqliteTable("canteens", {
  // id is set on insert, incrementing
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  // name of the canteen
  name: text("name").notNull(),
  // timestamp is set on insert
  timestamp: text("timestamp")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
export type InsertCanteens = typeof canteens.$inferInsert;
export type SelectCanteens = typeof canteens.$inferSelect;

// Definisi tabel menus
export const menus = sqliteTable("menus", {
  id: text("id").primaryKey().notNull(),
  canteenId: integer("canteenId").references(() => canteens.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
