import { createMiddleware } from "hono/factory";

export const apiMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header("api-key");
  const envApiKey = Bun.env.API_KEY;
  if (apiKey === envApiKey) {
    return next();
  } else {
    return c.json({ message: "need API key" }, 401);
  }
});

export const apiInvoiceCallbackMiddleware = createMiddleware(
  async (c, next) => {
    const callbackToken = c.req.header("X-CALLBACK-TOKEN");
    const envCallbackToken = Bun.env.XENDIT_CALLBACK_TOKEN;
    if (callbackToken === envCallbackToken) {
      return next();
    } else {
      return c.json({ message: "missing callback token" }, 401);
    }
  }
);
