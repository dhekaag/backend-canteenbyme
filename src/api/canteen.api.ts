import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { canteens as canteenSchema, menus as menuSchema } from "../db/schema";
import {
  createCanteenRepo,
  deleteCanteenRepo,
  getAllCanteenRepo,
  getAllCanteensWithSignatureMenus,
  updateCanteenRepo,
} from "../repositories/canteen.repository";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { neon } from "@neondatabase/serverless";
import { getMenuWithCanteenIdRepo } from "../repositories/menu.repository";
import { configDb } from "../db/config";
import { Env } from "../utils/config.env";

const canteenRouter = new Hono<{ Bindings: Env }>();

canteenRouter.get("/", async (c) => {
  try {
    const db = configDb(c);
    const result = await getAllCanteensWithSignatureMenus(db);
    if (result.length > 0) {
      return c.json({
        status: true,
        statusCode: 200,
        count: result.length,
        data: result,
      });
    }
    return c.json(
      { status: false, statusCode: 404, message: "canteen not found" },
      404
    );
  } catch (error) {
    return c.json(
      { status: false, statusCode: 500, message: "Internal server error" },
      500
    );
  }
});

canteenRouter.get(
  "/menu/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1).max(100),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");

    try {
      const db = configDb(c);
      const result = await getMenuWithCanteenIdRepo(db, id);
      if (result.length > 0) {
        return c.json({
          status: true,
          statusCode: 200,
          count: result.length,
          data: result,
        });
      }
      return c.json(
        { status: false, statusCode: 404, message: "menu not found" },
        404
      );
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "Internal server error" },
        500
      );
    }
  }
);

canteenRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(255),
      imageUrl: z.string().url(),
    })
  ),
  async (c) => {
    const { name, imageUrl } = c.req.valid("json");
    try {
      const db = configDb(c);
      const res = await createCanteenRepo(db, {
        id: uuidv4(),
        name,
        imageUrl,
      });
      if (!res) {
        return c.json(
          { status: false, statusCode: 500, message: "Internal server error" },
          500
        );
      }
      return c.json(
        { status: true, statusCode: 201, message: "create canteen success" },
        201
      );
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "Internal server error" },
        500
      );
    }
  }
);

canteenRouter.put(
  "/",
  zValidator(
    "json",
    z.object({
      id: z.string().min(1).max(100),
      name: z.string().optional(),
      open: z.boolean().optional(),
      imageUrl: z.string().url().optional(),
    })
  ),
  async (c) => {
    const { id, name, imageUrl, open } = c.req.valid("json");
    const nameChecked = name ?? undefined;
    const openChecked = open ?? undefined;

    try {
      const db = configDb(c);
      const res = await updateCanteenRepo(db, id, {
        name: nameChecked,
        imageUrl,
        open,
      });
      if (res === null) {
        return c.json({ message: "update failed" }, 500);
      }
      return c.json(
        {
          status: true,
          statusCode: 200,
          message: "Update canteen success",
          data: res,
        },
        200
      );
    } catch (error) {
      console.error("Error updating canteen:", error);
      return c.json(
        { status: false, statusCode: 500, message: "Internal server error" },
        500
      );
    }
  }
);

canteenRouter.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1).max(100),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const db = configDb(c);
      const res = await deleteCanteenRepo(db, id);
      if (!res) {
        return c.json({ message: "Canteen not found" }, 404);
      } else {
        return c.json(
          { status: true, statusCode: 200, message: "canteen deleted success" },
          200
        );
      }
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "internal Server error" },
        500
      );
    }
  }
);

export default canteenRouter;
