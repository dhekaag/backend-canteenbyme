import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { z } from "zod";
import { getMenuWithIdRepo } from "../repositories/menu.repository";
import { Env } from "../utils/config.env";
import { xenditInvoiceClient } from "../utils/xendit.services";
import { CreateInvoiceRequest } from "xendit-node/invoice/models/CreateInvoiceRequest";
import { SelectMenus } from "../db/schema";
import { Invoice, InvoiceItem } from "xendit-node/invoice/models";

const orderRouter = new Hono<{ Bindings: Env }>();

const menusSchema = z.object({
  id: z.string(),
  quantity: z.number(),
});

orderRouter.post(
  "/invoice",
  zValidator(
    "json",
    z.object({
      userName: z.string().min(1).max(100),
      userEmail: z.string().min(1).max(100),
      orderMenus: z.array(menusSchema),
      redirectUrl: z.string().optional(),
      description: z.string().optional(),
      fees: z.number().optional(),
    })
  ),
  async (c) => {
    const sql = neon(Bun.env.DATABASE_URL ?? "");
    const db = drizzle(sql);
    const { userName, userEmail, orderMenus, redirectUrl, description, fees } =
      c.req.valid("json");

    const menuId = orderMenus.map((menu) => menu.id);
    try {
      const menu: SelectMenus[] = await getMenuWithIdRepo(db, menuId);
      if (!menu) {
        return c.json(
          { status: false, statusCode: 404, message: "Menu not found" },
          404
        );
      } else {
        const items: InvoiceItem[] = menu.map((item) => {
          const orderItem = orderMenus.find(
            (orderMenu) => orderMenu.id === item.id
          );
          return {
            name: item.name,
            quantity: orderItem ? orderItem.quantity : 0,
            price: item.price,
          };
        });

        const totalPrice = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(
          2,
          "0"
        )} - ${String(currentDate.getMonth() + 1).padStart(2, "0")} - ${String(
          currentDate.getFullYear()
        ).slice(-2)}, ${String(currentDate.getHours()).padStart(
          2,
          "0"
        )}:${String(currentDate.getMinutes()).padStart(2, "0")}`;

        const data: CreateInvoiceRequest = {
          externalId: `Pesanan pada tanggal ${formattedDate}`,
          description: description,
          currency: "IDR",
          amount: totalPrice,
          fees: [
          {
            type: 'ADMIN',
            value: fees ?? 0,
          },
        ],
          invoiceDuration: "12000",
          customer: {
            givenNames: userName,
            email: userEmail,
          },
          customerNotificationPreference: {
            invoicePaid: ["email", "viber"],
          },
          successRedirectUrl: redirectUrl + "/verified",
          reminderTime: 1,
          items,
        };

        const xenditResponse: Invoice = await xenditInvoiceClient.createInvoice(
          {
            data,
          }
        );
        console.log("🚀 ~ xenditResponse:", xenditResponse);
        if (xenditResponse) {
          return c.json(
            {
              status: true,
              statusCode: 201,
              data: {
                invoiceId: xenditResponse.id,
                invoiceUrl: xenditResponse.invoiceUrl,
              },
            },
            201
          );
        }
      }
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "Internal server error" },
        500
      );
    }
  }
);

orderRouter.get(
  "/invoice/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1).max(100),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const sql = neon(Bun.env.DATABASE_URL ?? "");
    const db = drizzle(sql);
    try {
      const result: Invoice = await xenditInvoiceClient.getInvoiceById({
        invoiceId: id,
      });
      if (!result) {
        return c.json(
          { status: false, statusCode: 404, message: "invoice not found" },
          404
        );
      }
      return c.json(
        {
          status: true,
          statusCode: 200,
          data: {
            id: result.id,
            externalId: result.externalId,
            merchantName: result.merchantName,
            paymentMethod: result.paymentMethod,
            status: result.status,
            customerName: result.customer?.givenNames,
            customerEmail: result.customer?.email,
            totalPrice: result.amount,
            orderMenus: result.items,
            createdAt: result.created,
            updatedAt: result.updated,
          },
        },
        200
      );
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "Internal server error" },
        500
      );
    }
  }
);

export default orderRouter;
