import { DrizzleD1Database } from "drizzle-orm/d1";
import { InsertCanteens, SelectCanteens, canteens } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getAllCanteenRepo(
  db: DrizzleD1Database,
  canteenId: string
): Promise<SelectCanteens[]> {
  return await db.select().from(canteens).where(eq(canteens.name, canteenId));
}

export const createCanteenRepo = async (
  db: any,
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
export const deleteCanteenRepo = async (
  db: any,
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
