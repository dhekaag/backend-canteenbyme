import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Definisi tabel canteens
export const canteens = pgTable("canteens", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  open: boolean("open").notNull().default(true),
  updateAt: timestamp("update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definisi tabel menus
export const menus = pgTable("menus", {
  id: text("id").primaryKey().notNull(),
  canteenId: text("canteen_id")
    .references(() => canteens.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  signature: boolean("signature").notNull().default(false),
  imageUrl: text("image_url"),
  description: text("description"),
  updateAt: timestamp("update_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definisi tabel order
export const orders = pgTable("order", {
  id: text("id").primaryKey().notNull(),
  externalId: text("external_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  menus: text("menus")
    .array()
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  payment_method: text("payment_method").notNull(),
  status: text("status").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  totalPrice: integer("total_price").notNull(),
  totalItem: integer("total_price").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InsertCanteens = typeof canteens.$inferInsert;
export type SelectCanteens = typeof canteens.$inferSelect;
export type UpdateCanteens = typeof canteens.$inferSelect;
export type InsertMenus = typeof menus.$inferInsert;
export type SelectMenus = typeof menus.$inferSelect;
export type UpdateMenus = typeof menus.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
export type UpdateOrder = typeof orders.$inferSelect;
