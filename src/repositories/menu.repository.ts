import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { InsertMenus, SelectMenus, menus } from "../db/schema";
import { eq } from "drizzle-orm";

export const getAllMenuRepo = async (db: any): Promise<SelectMenus[]> => {
  return await db.select().from(menus).limit(100);
};

export const createMenuRepo = async (
  db: NeonHttpDatabase,
  data: InsertMenus
): Promise<boolean> => {
  try {
    await db.insert(menus).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return false;
  }
};

export const deleteMenuRepo = async (
  db: NeonHttpDatabase,
  id: string
): Promise<boolean> => {
  try {
    const res = await db
      .delete(menus)
      .where(eq(menus.id, id))
      .returning({ menu_id: menus.id });
    if (res.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete Menu:", error);
    return false;
  }
};
