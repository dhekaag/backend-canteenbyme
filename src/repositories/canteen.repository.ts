import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { configDb } from "../db/config";
import {
  InsertCanteens,
  SelectCanteens,
  UpdateCanteens,
  canteens as canteenSchema,
  menus as menuSchema,
} from "../db/schema";

export const getAllCanteenRepo = async (
  c: Context
): Promise<SelectCanteens[]> => {
  const db = configDb(c);
  return await db.query.canteens.findMany({ limit: 100 });
};

export const getAllCanteensWithSignatureMenus = async (
  c: Context
): Promise<any[]> => {
  const db = configDb(c);
  const resCanteens = await db.query.canteens.findMany({
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      open: true,
      createdAt: true,
    },
    with: {
      menus: {
        columns: {
          name: true,
        },
        where: (menus, { eq }) => eq(menus.signature, true),
      },
    },
  });

  return resCanteens.map((row) => ({
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    open: row.open,
    createdAt: row.createdAt,
    signatureMenu: row.menus.map((menu) => menu.name),
  }));
};

export const createCanteenRepo = async (
  c: Context,
  data: InsertCanteens
): Promise<boolean> => {
  try {
    const db = configDb(c);
    await db.insert(canteenSchema).values(data);
    return true;
  } catch (error) {
    console.error("Failed to create canteen:", error);
    return false;
  }
};

export const updateCanteenRepo = async (
  c: Context,
  id: string,
  data: Partial<UpdateCanteens>
): Promise<UpdateCanteens[] | null> => {
  try {
    const db = configDb(c);
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
  c: Context,
  id: string
): Promise<boolean> => {
  try {
    const db = configDb(c);
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
