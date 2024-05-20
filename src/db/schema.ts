import {
  pgTable,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Definisi tabel canteens
export const canteens = pgTable("canteens", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(), // Changed to text to match the intended type
  imageUrl: text("image_url"),
  updateAt: timestamp("update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definisi tabel menus
export const menus = pgTable("menus", {
  id: text("id").primaryKey().notNull(),
  canteenId: text("canteen_id")
    .references(() => canteens.id)
    .notNull(), // Ensure the type matches canteens.id
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  signature: boolean("signature").notNull().default(false),
  imageUrl: text("image_url"),
  description: text("description"),
  updateAt: timestamp("update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertCanteens = typeof canteens.$inferInsert;
export type SelectCanteens = typeof canteens.$inferSelect;
export type UpdateCanteens = typeof canteens.$inferSelect;
export type InsertMenus = typeof menus.$inferInsert;
export type SelectMenus = typeof menus.$inferSelect;
