import { eq, inArray } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import {
  InsertMenus,
  SelectMenus,
  UpdateMenus,
  menus as menuSchema,
} from "../db/schema";
import { configDb } from "../db/config";

export const getAllMenuRepo = async (c: Context): Promise<SelectMenus[]> => {
  const db = configDb(c);
  return await db.query.menus.findMany({ limit: 100 });
};

export const getMenuWithIdRepo = async (
  c: Context,
  menuId: string[]
): Promise<SelectMenus[]> => {
  const db = configDb(c);
  return await db.query.menus.findMany({
    where: inArray(menuSchema.id, menuId),
  });
};

export const getMenuWithCanteenIdRepo = async (
  c: Context,
  canteenId: string
): Promise<SelectMenus[]> => {
  const db = configDb(c);
  return await db.query.menus.findMany({
    where: eq(menuSchema.canteenId, canteenId),
    limit: 100,
  });
};

export const createMenuRepo = async (
  c: Context,
  data: InsertMenus
): Promise<boolean> => {
  try {
    const db = configDb(c);
    await db.insert(menuSchema).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return false;
  }
};

export const updateMenuRepo = async (
  c: Context,
  id: string,
  data: Partial<UpdateMenus>
): Promise<UpdateMenus[] | null> => {
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null)
    );

    const db = configDb(c);
    const res = await db
      .update(menuSchema)
      .set(updateData)
      .where(eq(menuSchema.id, id))
      .returning();
    return res;
  } catch (error) {
    console.error("Failed to update canteen:", error);
    throw error;
  }
};

export const deleteMenuRepo = async (
  c: Context,
  id: string
): Promise<boolean> => {
  try {
    const db = configDb(c);
    const res = await db
      .delete(menuSchema)
      .where(eq(menuSchema.id, id))
      .returning({ menu_id: menuSchema.id });
    if (res.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete Menu:", error);
    return false;
  }
};
