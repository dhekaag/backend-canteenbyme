import { Hono } from "hono";
import canteenRouter from "../api/canteen.api";
import menuRouter from "../api/menu.api";
import orderRouter from "../api/order.api";
import { apiMiddleware } from "../middleware/api.middleware";
import { authRouter } from "../middleware/authentication";
import { Env } from "../utils/config.env";

export const apiRouter = new Hono<{ Bindings: Env }>().basePath("v1");

apiRouter.use("/canteens", (c, next) => apiMiddleware(c, next));
apiRouter.use("/menus", (c, next) => apiMiddleware(c, next));

apiRouter.route("/auth", authRouter);
apiRouter.route("/canteens", canteenRouter);
apiRouter.route("/menus", menuRouter);
apiRouter.route("/orders", orderRouter);
