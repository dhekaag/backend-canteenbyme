import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { InsertMenus, InsertOrder, orders as orderSchema } from "../db/schema";

export const createOrderRepo = async (
  db: NeonHttpDatabase,
  data: InsertOrder
): Promise<boolean> => {
  try {
    await db.insert(orderSchema).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return false;
  }
};
