import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  InsertMenus,
  SelectMenus,
  UpdateMenus,
  menus as menuSchema,
} from "../db/schema";
import { eq, ilike, inArray } from "drizzle-orm";

export const getAllMenuRepo = async (db: any): Promise<SelectMenus[]> => {
  return await db.select().from(menuSchema).limit(100);
};

export const getMenuWithIdRepo = async (
  db: NeonHttpDatabase,
  menuId: string[]
): Promise<SelectMenus[]> => {
  return await db
    .select()
    .from(menuSchema)
    .where(inArray(menuSchema.id, menuId));
};

export const getMenuWithCanteenIdRepo = async (
  db: any,
  canteenId: string
): Promise<SelectMenus[]> => {
  return await db
    .select()
    .from(menuSchema)
    .where(eq(menuSchema.canteenId, canteenId))
    .limit(100);
};

export const createMenuRepo = async (
  db: NeonHttpDatabase,
  data: InsertMenus
): Promise<boolean> => {
  try {
    await db.insert(menuSchema).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return false;
  }
};

export const updateMenuRepo = async (
  db: NeonHttpDatabase,
  id: string,
  data: Partial<UpdateMenus>
): Promise<UpdateMenus[] | null> => {
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null)
    );
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
  db: NeonHttpDatabase,
  id: string
): Promise<boolean> => {
  try {
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
