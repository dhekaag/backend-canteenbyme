import { Hono } from "hono";
import canteenRouter from "./routes/canteen.routes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { poweredBy } from "hono/powered-by";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { SwaggerUI } from "@hono/swagger-ui";
import swaggerApp from "./middleware/documentation";

export type Env = {
  DATABASE_URL: string;
};

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

const app = new Hono<{ Bindings: Env }>();
app.use(logger(customLogger));
app.use(poweredBy());
app.use("*", cors());

app.route("/canteens", canteenRouter);

app.get("/", (c) => {
  return c.json({
    status: true,
    statusCode: 200,
    message: "Hello world",
  });
});

export default app;
