import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Invoice, InvoiceItem } from "xendit-node/invoice/models";
import { CreateInvoiceRequest } from "xendit-node/invoice/models/CreateInvoiceRequest";
import { z } from "zod";
import { configDb } from "../db/config";
import { SelectMenus } from "../db/schema";
import { getMenuWithIdRepo } from "../repositories/menu.repository";
import {
  createOrderMenusRepo,
  createOrderRepo,
  getOrdersWithUserIdRepo,
  updateOrderRepo,
} from "../repositories/order.repository";
import { Env } from "../utils/config.env";
import { OrderIdGenerator } from "../utils/id.generator";
import { xenditInvoiceClient } from "../utils/xendit.services";

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
      userId: z.string().min(1).max(100),
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
      userId,
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
      const menu: SelectMenus[] = await getMenuWithIdRepo(c, menuId);
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
          externalId: `Meja:${tableNumber},nomor pesananan:${orderId}`,
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
          successRedirectUrl: `${redirectUrl}/verified`,
          reminderTime: 1,
          items,
        };

        const xenditResponse: Invoice = await xenditInvoiceClient(
          c
        ).createInvoice({
          data,
        });
        console.log("🚀 ~ xenditResponse:", xenditResponse);
        if (xenditResponse) {
          const createOrder = await createOrderRepo(c, {
            id: xenditResponse.id!!,
            orderNumber: orderId,
            tableNumber: tableNumber.toString(),
            userId: userId,
            paymentMethod: xenditResponse.paymentMethod!!,
            status: xenditResponse.status,
            totalItem: orderMenus.length,
            totalPrice: totalPrice,
            updatedAt: xenditResponse.updated.toISOString(),
            createdAt: xenditResponse.created.toISOString(),
          });

          const createOrderMenusData = orderMenus.map((menu) => ({
            orderId: xenditResponse.id!!,
            menuId: menu.id,
          }));

          const createOrderMenus = await createOrderMenusRepo(
            c,
            createOrderMenusData
          );

          if (createOrder !== null && createOrderMenus !== null) {
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
          } else {
            return c.json(
              {
                status: false,
                statusCode: 404,
                message: "insert invoice to database error",
              },
              500
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
  "/invoice/notify",
  zValidator(
    "json",
    z.object({
      id: z.string().min(1).max(100),
      status: z.string(),
      updated: z.string(),
      paid_at: z.string().optional(),
      external_id: z.string().optional(),
      ewallet_type: z.string().optional(),
    })
  ),
  async (c) => {
    const { id, updated, status, ewallet_type, paid_at } = c.req.valid("json");
    try {
      const updateOrder = await updateOrderRepo(c, id, {
        status: status,
        paymentMethod: ewallet_type,
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
      const result: Invoice = await xenditInvoiceClient(c).getInvoiceById({
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

orderRouter.get(
  "/user/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1).max(100),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const queryOrders = await getOrdersWithUserIdRepo(c, id);
      console.log("🚀 ~ result:", queryOrders);
      if (queryOrders !== null) {
        return c.json(
          {
            status: true,
            statusCode: 200,
            data: queryOrders,
          },
          200
        );
      }
    } catch (error) {
      console.log("🚀 ~ error:", error);

      return c.json(
        { status: false, statusCode: 404, message: "Order not found" },
        404
      );
    }
  }
);

export default orderRouter;
