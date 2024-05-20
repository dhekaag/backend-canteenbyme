import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  InsertCanteens,
  SelectCanteens,
  UpdateCanteens,
  canteens,
  menus,
} from "../db/schema";
import { eq } from "drizzle-orm";

export const getAllCanteenRepo = async (db: any): Promise<SelectCanteens[]> => {
  return await db.select().from(canteens);
};

export const getAllCanteensWithSignatureMenus = async (
  db: NeonHttpDatabase
): Promise<any[]> => {
  const result = await db
    .select({
      canteenId: canteens.id,
      canteenName: canteens.name,
      canteenImageUrl: canteens.imageUrl,
      createdAt: canteens.createdAt,
      signatureMenus: {
        menuName: menus.name,
        menuPrice: menus.price,
        menuDescription: menus.description,
        menuImageUrl: menus.imageUrl,
      },
    })
    .from(canteens)
    .leftJoin(menus, eq(menus.canteenId, canteens.id))
    .where(eq(menus.signature, true));

  return result.map((row) => ({
    id: row.canteenId,
    name: row.canteenName,
    imageUrl: row.canteenImageUrl,
    createdAt: row.createdAt,
    signatureMenus: row.signatureMenus,
  }));
};

export const createCanteenRepo = async (
  db: NeonHttpDatabase,
  data: InsertCanteens
): Promise<boolean> => {
  try {
    await db.insert(canteens).values(data);
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
      .update(canteens)
      .set(updateData)
      .where(eq(canteens.id, id))
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
      .delete(canteens)
      .where(eq(canteens.id, id))
      .returning({ canteen_id: canteens.id });
    if (res.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete canteen:", error);
    return false;
  }
};
