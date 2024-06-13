import { Context } from "hono";
import { Xendit, Invoice as InvoiceClient } from "xendit-node";

// config({ path: ".dev.vars" });

export const xenditClient = (c: Context) =>
  new Xendit({
    secretKey: Bun.env.XENDIT_SECRET_KEY ?? "",
  });

export const xenditInvoiceClient = (c: Context) =>
  new InvoiceClient({
    secretKey: Bun.env.XENDIT_SECRET_KEY ?? "",
  });
