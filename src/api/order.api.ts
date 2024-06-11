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
import { OrderIdGenerator } from "../utils/id.generator";
import {
  createOrderRepo,
  updateOrderRepo,
} from "../repositories/order.repository";
import { configDb } from "../db/config";

const orderRouter = new Hono<{ Bindings: Env }>();

const orderIdGenerator = new OrderIdGenerator(100);

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
      tableNumber: z.number().min(1).max(100),
      orderMenus: z.array(menusSchema),
      redirectUrl: z.string().optional(),
      description: z.string().optional(),
      fees: z.number().optional(),
    })
  ),
  async (c) => {
    const {
      userName,
      userEmail,
      orderMenus,
      redirectUrl,
      description,
      fees,
      tableNumber,
    } = c.req.valid("json");

    const menuId = orderMenus.map((menu) => menu.id);
    try {
      const db = configDb(c);
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
        const orderId = orderIdGenerator.nextId();
        const data: CreateInvoiceRequest = {
          externalId: `Meja:${tableNumber},nomor pesananan:C${orderId}`,
          description: description,
          currency: "IDR",
          amount: totalPrice,
          fees: [
            {
              type: "ADMIN",
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
          const createOrder = await createOrderRepo(db, {
            id: xenditResponse.id!!,
            externalId: xenditResponse.externalId,
            userName: userName,
            userEmail: userEmail,
            menus: menuId,
            payment_method: xenditResponse.paymentMethod!!,
            status: xenditResponse.status,
            totalItem: orderMenus.length,
            totalPrice: totalPrice,
            updatedAt: xenditResponse.updated,
            createdAt: xenditResponse.created,
          });
          if (createOrder) {
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
      }
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "create invoice error" },
        500
      );
    }
  }
);
orderRouter.post(
  "/invoice/callback",
  zValidator(
    "json",
    z.object({
      id: z.string().min(1).max(100),
      status: z.string(),
      updated: z.date(),
      paid_at: z.date().optional(),

      external_id: z.string().optional(),
      ewallet_type: z.string().optional(),
    })
  ),
  async (c) => {
    const { id, updated, status, ewallet_type, paid_at } = c.req.valid("json");
    try {
      const db = configDb(c);
      const updateOrder = await updateOrderRepo(db, id, {
        status: status,
        payment_method: ewallet_type,
        paidAt: paid_at,
        updatedAt: updated,
      });
      if (updateOrder !== null) {
        return c.json(
          {
            status: false,
            statusCode: 500,
            message: "update order success",
            data: updateOrder,
          },
          200
        );
      }
    } catch (error) {
      return c.json(
        { status: false, statusCode: 500, message: "update order error" },
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
    try {
      const db = configDb(c);
      const result: Invoice = await xenditInvoiceClient.getInvoiceById({
        invoiceId: id,
      });
      console.log("🚀 ~ result:", result);

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
      console.log("🚀 ~ error:", error);

      return c.json(
        { status: false, statusCode: 404, message: "Invoice not found" },
        404
      );
    }
  }
);

export default orderRouter;
