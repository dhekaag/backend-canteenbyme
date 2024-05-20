import { sql } from "drizzle-orm";
import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

// Definisi tabel canteens
export const canteens = pgTable("canteens", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(), // Changed to text to match the intended type
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type InsertCanteens = typeof canteens.$inferInsert;
export type SelectCanteens = typeof canteens.$inferSelect;

// Definisi tabel menus
export const menus = pgTable("menus", {
  id: text("id").primaryKey().notNull(),
  canteenId: text("canteen_id")
    .references(() => canteens.id)
    .notNull(), // Ensure the type matches canteens.id
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
