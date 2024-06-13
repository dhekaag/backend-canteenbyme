import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { apiRouter } from "./routes/api.routes";
import { Env } from "./utils/config.env";

const app = new Hono<{ Bindings: Env }>();

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

app.use(logger(customLogger));
app.use(poweredBy());
app.use("*", cors());
app.route("/", apiRouter);

app.get("/", (c) => {
  return c.json({
    status: true,
    statusCode: 200,
    message: "Hello, welcome to canteenbyme",
  });
});

const server = Bun.serve({
  hostname: "::",
  port: Bun.env.PORT ?? 3000,
  fetch: app.fetch,
});
console.log(`Listening on http://localhost:${server.port}`);

// export default {
//   port: 8080,
//   fetch: app.fetch,
// };
