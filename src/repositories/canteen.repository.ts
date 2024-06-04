import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  InsertCanteens,
  SelectCanteens,
  UpdateCanteens,
  canteens as canteenSchema,
  menus as menuSchema,
} from "../db/schema";
import { and, eq } from "drizzle-orm";
import { union } from "zod";

export const getAllCanteenRepo = async (db: any): Promise<SelectCanteens[]> => {
  return await db.select().from(canteenSchema);
};

export const getAllCanteensWithSignatureMenus = async (
  db: NeonHttpDatabase<{}>
): Promise<any[]> => {
  const resCanteens = await db.select().from(canteenSchema);
  const getSignatureMenu = async (canteenId: string) => {
    const menus = await db
      .select({ name: menuSchema.name })
      .from(menuSchema)
      .where(
        and(eq(menuSchema.canteenId, canteenId), eq(menuSchema.signature, true))
      );
    return menus.map((menu) => menu.name);
  };

  const canteensWithMenus = await Promise.all(
    resCanteens.map(async (row) => ({
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl,
      open: row.open,
      createdAt: row.createdAt,
      signatureMenu: await getSignatureMenu(row.id),
    }))
  );

  return canteensWithMenus;
};

export const createCanteenRepo = async (
  db: NeonHttpDatabase,
  data: InsertCanteens
): Promise<boolean> => {
  try {
    await db.insert(canteenSchema).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create canteen:", error);
    return false;
  }
};

export const updateCanteenRepo = async (
  db: NeonHttpDatabase,
  id: string,
  data: Partial<UpdateCanteens>
): Promise<UpdateCanteens[] | null> => {
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null)
    );
    const res = await db
      .update(canteenSchema)
      .set(updateData)
      .where(eq(canteenSchema.id, id))
      .returning();
    return res;
  } catch (error) {
    console.error("Failed to update canteen:", error);
    throw error;
  }
};

export const deleteCanteenRepo = async (
  db: NeonHttpDatabase,
  id: string
): Promise<boolean> => {
  try {
    const res = await db
      .delete(canteenSchema)
      .where(eq(canteenSchema.id, id))
      .returning({ canteen_id: canteenSchema.id });
    if (res.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete canteen:", error);
    return false;
  }
};
