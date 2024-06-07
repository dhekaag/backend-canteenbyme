import { config } from "dotenv";
import { Xendit, Invoice as InvoiceClient } from "xendit-node";

config({ path: ".dev.vars" });

const xenditClient = new Xendit({
  secretKey: Bun.env.XENDIT_SECRET_KEY ?? "",
});

const { Invoice } = xenditClient;

export const xenditInvoiceClient = new InvoiceClient({
  secretKey: Bun.env.XENDIT_SECRET_KEY ?? "",
});
