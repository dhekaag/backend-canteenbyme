import { eq } from "drizzle-orm";
import { Context } from "hono";
import { configDb } from "../db/config";
import {
  InsertOrder,
  InsertOrderMenus,
  SelectOrder,
  UpdateOrder,
  orderMenus as orderMenuSchema,
  orders as orderSchema,
} from "../db/schema";

export const getOrdersWithUserIdRepo = async (
  c: Context,
  id: string
): Promise<SelectOrder[] | null> => {
  try {
    const db = configDb(c);
    const queryOrders = await db.query.orders.findMany({
      where: (orders, { eq }) => eq(orders.userId, id),
      with: {
        orderMenus: {
          columns: {
            menuId: false,
            orderId: false,
          },
          with: {
            menu: {
              columns: {
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
    });
    return queryOrders.map((row) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      tableNumber: row.tableNumber,
      userId: row.userId,
      paymentMethod: row.paymentMethod,
      status: row.status,
      paidAt: row.paidAt,
      totalPrice: row.totalPrice,
      totalItem: row.totalItem,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      orderMenus: row.orderMenus.map((item) => item.menu),
    }));
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return null;
  }
};

export const createOrderRepo = async (
  c: Context,
  data: InsertOrder
): Promise<InsertOrder[] | null> => {
  try {
    const db = configDb(c);
    const insertOrder = await db.insert(orderSchema).values(data).returning();
    return insertOrder;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return null;
  }
};

export const createOrderMenusRepo = async (
  c: Context,
  data: InsertOrderMenus[]
): Promise<InsertOrderMenus[] | null> => {
  try {
    const db = configDb(c);
    const insertOrderMenus = await db
      .insert(orderMenuSchema)
      .values(data)
      .returning();
    return insertOrderMenus;
  } catch (error) {
    console.error("Failed to create Menu:", error);
    return null;
  }
};

export const updateOrderRepo = async (
  c: Context,
  id: string,
  data: Partial<UpdateOrder>
): Promise<UpdateOrder[] | null> => {
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== null)
    );
    const db = configDb(c);
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
