import { Context } from "hono";
import { configDb } from "../db/config";
import { eq } from "drizzle-orm";

export const getUserSessionWithTokenRepo = async (
  c: Context,
  token: string
) => {
  try {
    const db = configDb(c);
    return await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.sessionToken, token),
    });
  } catch (error) {
    console.error("🚀 ~ getUserSessionWithTokenRepo ~ error:", error);
    return null;
  }
};
