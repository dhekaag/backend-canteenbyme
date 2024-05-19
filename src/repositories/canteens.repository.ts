import { DrizzleD1Database } from "drizzle-orm/d1";
import { InsertCanteens, SelectCanteens, canteens } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getCanteens(
  db: DrizzleD1Database,
  canteenId: string
): Promise<SelectCanteens[]> {
  return await db.select().from(canteens).where(eq(canteens.name, canteenId));
}

export const createCanteen = async (
  db: DrizzleD1Database,
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
