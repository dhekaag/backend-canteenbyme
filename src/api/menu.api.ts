import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { canteens } from "../db/schema";
import {
  createCanteenRepo,
  deleteCanteenRepo,
  getAllCanteenRepo,
} from "../repositories/canteen.repository";
import { Hono } from "hono";
import { Env } from "..";
import { v4 as uuidv4 } from "uuid";
import { neon } from "@neondatabase/serverless";

const menuRouter = new Hono<{ Bindings: Env }>();

menuRouter.get("/", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  try {
    const result = await getAllCanteenRepo(db);
    if (result.length > 0) {
      return c.json(result);
    }
    return c.json({ message: "canteen not found" }, 404);
  } catch (error) {
    return c.json({ message: "internal server error" }, 500);
  }
});

menuRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(255),
      imageUrl: z.string().url(),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    const { name, imageUrl } = c.req.valid("json");
    try {
      const res = await createCanteenRepo(db, {
        id: uuidv4(),
        name,
        imageUrl,
      });
      if (!res) {
        return c.json({ message: "Internal server error" }, 500);
      }
      return c.json({ message: "create canteen success" }, 201);
    } catch (error) {
      return c.json({ message: "Internal server error" }, 500);
    }
  }
);

menuRouter.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1).max(100),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
    const { id } = c.req.valid("param");
    try {
      const res = await deleteCanteenRepo(db, id);
      if (!res) {
        return c.json({ message: "Canteen not found" }, 404);
      } else {
        return c.json({ message: "canteen deleted success" }, 200);
      }
    } catch (error) {
      return c.json({ message: "internal Server error" }, 500);
    }
  }
);

export default menuRouter;
