import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import canteenRouter from "./api/canteen.api";
import menuRouter from "./api/menu.api";
import { Env } from "./utils/config.env";
import { authRouter } from "./middleware/authentication";

const app = new Hono<{ Bindings: Env }>();

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

app.use(logger(customLogger));
app.use(poweredBy());
app.use("*", cors());

app.route("/auth", authRouter);
app.route("/canteens", canteenRouter);
app.route("/menus", menuRouter);
app.route("/orders", menuRouter);

app.get("/", (c) => {
  return c.json({
    status: true,
    statusCode: 200,
    message: "Hello world",
  });
});
const server = Bun.serve({
  hostname: "::",
  port: process.env.PORT ?? 3000,
  fetch: app.fetch,
  // fetch(request) {
  //   return new Response("Welcome to Bun!");
  // },
});

console.log(`Listening on http://localhost:${server.port}`);
// export default {
//   port: 8080,
//   fetch: app.fetch,
// };
