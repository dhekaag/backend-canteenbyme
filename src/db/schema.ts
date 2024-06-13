import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Definisi tabel users
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  role: text("role"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Definisi tabel accounts
export const accounts = pgTable("accounts", {
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Definisi tabel sessions
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").unique().notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Definisi tabel canteens
export const canteens = pgTable("canteens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  open: boolean("open").notNull().default(true),
  updateAt: timestamp("update_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Definisi tabel menus
export const menus = pgTable("menus", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  canteenId: text("canteen_id")
    .references(() => canteens.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  signature: boolean("signature").notNull().default(false),
  imageUrl: text("image_url"),
  description: text("description"),
  updateAt: timestamp("update_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Definisi tabel orders
export const orders = pgTable("orders", {
  id: text("id").primaryKey().notNull(),
  orderNumber: integer("order_number").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tableNumber: text("table_number").notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").notNull(),
  paidAt: text("paid_at"),
  totalPrice: integer("total_price").notNull(),
  totalItem: integer("total_item").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

// Definisi tabel orderMenus
export const orderMenus = pgTable("order_menus", {
  orderId: text("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  menuId: text("menu_id")
    .references(() => menus.id, { onDelete: "cascade" })
    .notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Relasi antara tabel menus dan orders melalui orderMenus
export const canteensRelations = relations(canteens, ({ many }) => ({
  menus: many(menus),
}));

// Relasi antara tabel menus dan orders melalui orderMenus
export const menuRelations = relations(menus, ({ many, one }) => ({
  canteens: one(canteens, {
    fields: [menus.canteenId],
    references: [canteens.id],
  }),
  orderMenus: many(orderMenus),
}));

export const orderRelations = relations(orders, ({ many }) => ({
  orderMenus: many(orderMenus),
}));

export const orderMenuRelations = relations(orderMenus, ({ one }) => ({
  order: one(orders, {
    fields: [orderMenus.orderId],
    references: [orders.id],
  }),
  menu: one(menus, {
    fields: [orderMenus.menuId],
    references: [menus.id],
  }),
}));

export type InsertCanteens = typeof canteens.$inferInsert;
export type SelectCanteens = typeof canteens.$inferSelect;
export type UpdateCanteens = typeof canteens.$inferSelect;
export type InsertMenus = typeof menus.$inferInsert;
export type SelectMenus = typeof menus.$inferSelect;
export type UpdateMenus = typeof menus.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
export type UpdateOrder = typeof orders.$inferSelect;
export type SelectOrderMenus = typeof orderMenus.$inferSelect;
export type InsertOrderMenus = typeof orderMenus.$inferInsert;
export type UpdateOrderMenus = typeof orderMenus.$inferSelect;
