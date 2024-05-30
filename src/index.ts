import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import canteenRouter from "./api/canteen.api";
import menuRouter from "./api/menu.api";
import { searchRouter } from "./api/search.api";
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
app.route("/search", searchRouter);

app.get("/", (c) => {
  return c.json({
    status: true,
    statusCode: 200,
    message: "Hello world",
  });
});

app.fire();

export default app;
