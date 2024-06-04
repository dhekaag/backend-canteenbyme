// import { Hono } from "hono";
// import { Env } from "../utils/config.env";
// import { v4 as uuidv4 } from "uuid";
// import { zValidator } from "@hono/zod-validator";
// import { z } from "zod";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";

// const menuRouter = new Hono<{ Bindings: Env }>();

// menuRouter.post(
//   "/",
//   zValidator(
//     "json",
//     z.object({
//       name: z.string().min(1).max(100),
//       type: z.string().min(1).max(100),
//       canteenId: z.string().min(1).max(100),
//       price: z.number().min(1).max(1000000),
//       signature: z.boolean().default(false),
//       imageUrl: z.string().url().nullable(),
//       description: z.string().min(1).max(100).nullable(),
//     })
//   ),
//   async (c) => {
//     const sql = neon(c.env.DATABASE_URL);
//     const db = drizzle(sql);
//     const { name, imageUrl, type, canteenId, price, description, signature } =
//       c.req.valid("json");
//     try {
//       const res = await createMenuRepo(db, {
//         id: uuidv4(),
//         name,
//         type,
//         canteenId,
//         price,
//         signature,
//         imageUrl,
//         description,
//       });
//       if (!res) {
//         return c.json({ message: "Internal server error" }, 500);
//       }
//       return c.json(
//         { status: true, statusCode: 201, message: "create order success" },
//         201
//       );
//     } catch (error) {
//       return c.json(
//         { status: false, statusCode: 500, message: "Internal server error" },
//         500
//       );
//     }
//   }
// );
