import { Hono } from "hono";
import { Env } from "../utils/config.env";

export const authRouter = new Hono<{ Bindings: Env }>();

authRouter.get("/", async (c) => {
  const env: Env = c.env;
  const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
  const responseType = "code";
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/userinfo.email"
  );
  const accessType = "offline"; // For getting a refresh token

  // Construct the authorization URL manually
  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?response_type=${responseType}&client_id=${encodeURIComponent(
    env.GOOGLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    env.GOOGLE_REDIRECT_URI
  )}&scope=${scope}&access_type=${accessType}`;

  return c.redirect(authUrl);
});

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

// OAuth callback route
authRouter.get("/callback", async (c) => {
  const env: Env = c.env;
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return c.text("Authorization code not found", 400);
  }

  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: any = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return c.text(
        `Failed to obtain access token: ${
          tokenData.error_description || tokenData.error
        }`,
        400
      );
    }

    if (!tokenData.access_token) {
      return c.text("Failed to obtain access token", 400);
    }

    // Process the access token and create the user account here
    return c.text("User account created successfully.");
  } catch (error) {
    return c.text(
      `Error during token exchange: ${(error as Error).message}`,
      500
    );
  }
});
