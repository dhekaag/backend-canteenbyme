import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  InsertMenus,
  InsertOrder,
  SelectOrder,
  UpdateOrder,
  orders as orderSchema,
} from "../db/schema";
import { eq } from "drizzle-orm";

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

export const updateOrderRepo = async (
  db: NeonHttpDatabase,
  id: string,
  data: Partial<UpdateOrder>
): Promise<UpdateOrder[] | null> => {
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null)
    );
    const res = await db
      .update(orderSchema)
      .set(updateData)
      .where(eq(orderSchema.id, id))
      .returning();
    return res;
  } catch (error) {
    console.error("Failed to update Menu:", error);
    return null;
  }
};
