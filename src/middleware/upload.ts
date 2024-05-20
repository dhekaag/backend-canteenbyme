import { Context, Next } from "hono";

export const imageUploadMiddleware = async (c: Context, next: Next) => {
  const contentType = c.req.header("Content-Type");

  if (!contentType || !contentType.includes("multipart/form-data")) {
    return c.json({ message: "Content-Type must be multipart/form-data" }, 400);
  }

  const { image } = await c.req.parseBody();
  // const image = req;

  if (!image || !(image instanceof File)) {
    return c.json({ message: "Image file is required" }, 400);
  }

  const fileType = image.type;
  if (fileType !== "image/jpeg" && fileType !== "image/jpg") {
    return c.json({ message: "Only .jpg or .jpeg files are allowed" }, 400);
  }

  c.set("image", image);
  await next();
};
