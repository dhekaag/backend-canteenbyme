import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { zValidator } from "@hono/zod-validator";
import { canteens } from "./db/schema";
import { createCanteen } from "./repositories/canteens.repository";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app
  .get("/", (c) => {
    return c.json({
      status: true,
      statusCode: 200,
      message: "Hello world",
    });
  })
  .get("/canteens", async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(canteens).all();
    return c.json(result);
  })
  .post(
    "/canteens",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(255),
      })
    ),
    async (c) => {
      const db = drizzle(c.env.DB);
      const { name } = c.req.valid("json");

      const res = await createCanteen(db, {
        name,
      });
      if (!res) {
        return c.json({ message: "Internal server error" }, 500);
      }
      return c.json({ message: "create canteen success" }, 201);
    }
  );

export default app;
